// ============================================================
// SERVIDOR (backend) de AforoPUCP
// ------------------------------------------------------------
// La aplicación mantiene la misma API y la misma lógica del
// proyecto. En Render, los datos persistentes se guardan en
// PostgreSQL mediante DATABASE_URL.
// En desarrollo local, si no existe DATABASE_URL, se conserva
// server/db.json para poder trabajar sin configurar Render.
// ============================================================

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BUNDLED_DB_PATH = path.join(__dirname, 'db.json');
const usePostgres = !!process.env.DATABASE_URL;

// Render/PostgreSQL necesita SSL en conexiones externas.
// En desarrollo local, PostgreSQL puede funcionar sin SSL.
const pool = usePostgres
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 5,
    })
  : null;

let databaseReadyPromise = null;

function readLocalDb() {
  return JSON.parse(fs.readFileSync(BUNDLED_DB_PATH, 'utf-8'));
}

function writeLocalDb(db) {
  fs.writeFileSync(BUNDLED_DB_PATH, JSON.stringify(db, null, 2));
}

async function ensurePostgres() {
  if (!pool) return;
  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS aforopucp_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const existing = await pool.query(
        'SELECT id FROM aforopucp_state WHERE id = 1'
      );

      // Primera ejecución: toma los datos iniciales que ya vienen
      // en server/db.json y los coloca en PostgreSQL.
      if (existing.rowCount === 0) {
        const initialDb = readLocalDb();
        await pool.query(
          `INSERT INTO aforopucp_state (id, data) VALUES (1, $1::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(initialDb)]
        );
      }
    })().catch((error) => {
      databaseReadyPromise = null;
      throw error;
    });
  }

  await databaseReadyPromise;
}

async function readDb() {
  if (!pool) return readLocalDb();

  await ensurePostgres();
  const result = await pool.query(
    'SELECT data FROM aforopucp_state WHERE id = 1'
  );

  if (result.rowCount === 0) {
    throw new Error('No se pudo inicializar la base de datos de AforoPUCP.');
  }

  return result.rows[0].data;
}

// Ejecuta una modificación dentro de una transacción y bloquea la
// fila mientras se modifica. Esto evita que dos reportes enviados
// casi al mismo tiempo se pisen entre sí.
async function updateDb(mutator) {
  if (!pool) {
    const db = readLocalDb();
    const result = await mutator(db);
    writeLocalDb(db);
    return result;
  }

  await ensurePostgres();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT data FROM aforopucp_state WHERE id = 1 FOR UPDATE'
    );

    const db = result.rows[0].data;
    const mutationResult = await mutator(db);

    await client.query(
      `UPDATE aforopucp_state
       SET data = $1::jsonb, updated_at = NOW()
       WHERE id = 1`,
      [JSON.stringify(db)]
    );

    await client.query('COMMIT');
    return mutationResult;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const app = express();
app.use(express.json({ limit: '2mb' }));

// Permite que el frontend pueda comunicarse con este servidor.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Recalcula el % general de un edificio a partir de sus pisos.
function recalcBuildingOccupancy(building) {
  const avg = Math.round(
    building.floors.reduce((acc, f) => acc + f.occupancyPercent, 0) /
      building.floors.length
  );
  building.generalOccupancyPercent = avg;
  building.status =
    avg >= 85 ? 'saturated' : avg >= 50 ? 'moderate' : 'available';
  building.lastUpdatedMinutesAgo = 0;
  return building;
}

// ---------------- EDIFICIOS Y PISOS ----------------

app.get('/api/buildings', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.buildings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los edificios' });
  }
});

app.put('/api/buildings/:buildingId/floors/:floorId', async (req, res) => {
  try {
    const { buildingId, floorId } = req.params;
    const updates = req.body;

    const result = await updateDb((db) => {
      const building = db.buildings.find((b) => b.id === buildingId);
      if (!building) return { error: 'Edificio no encontrado', status: 404 };

      const floor = building.floors.find((f) => f.id === floorId);
      if (!floor) return { error: 'Piso no encontrado', status: 404 };

      Object.assign(floor, updates);
      if (updates.occupancyPercent !== undefined) {
        floor.occupiedSeats = Math.round(
          (updates.occupancyPercent / 100) * floor.totalSeats
        );
      }
      floor.lastUpdatedMinutesAgo = 0;

      recalcBuildingOccupancy(building);
      return { building, floor };
    });

    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el piso' });
  }
});

app.put('/api/buildings/:buildingId/cubicles/:cubicleId/toggle', async (req, res) => {
  try {
    const { buildingId, cubicleId } = req.params;

    const result = await updateDb((db) => {
      const building = db.buildings.find((b) => b.id === buildingId);
      if (!building) return { error: 'Edificio no encontrado', status: 404 };

      let updatedCubicle = null;
      for (const floor of building.floors) {
        const cubicle = floor.cubicles.find((c) => c.id === cubicleId);
        if (cubicle) {
          cubicle.isOccupied = !cubicle.isOccupied;
          cubicle.status = cubicle.isOccupied ? 'saturated' : 'available';
          cubicle.occupiedUntil = cubicle.isOccupied ? '18:00' : undefined;
          floor.lastUpdatedMinutesAgo = 0;
          updatedCubicle = cubicle;
        }
      }

      if (!updatedCubicle)
        return { error: 'Cubículo no encontrado', status: 404 };

      return { building };
    });

    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el cubículo' });
  }
});

// ---------------- REPORTES DE LA COMUNIDAD ----------------

app.get('/api/reports', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.communityReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los reportes' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const result = await updateDb((db) => {
      const newReport = {
        id: `crep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        timestamp: new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'America/Lima',
        }),
        verified: false,
        helpfulCount: 0,
        helpfulVotedByMe: false,
        ...req.body,
      };

      db.communityReports.unshift(newReport);
      return newReport;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo guardar el reporte' });
  }
});

app.post('/api/reports/:id/helpful', async (req, res) => {
  try {
    const result = await updateDb((db) => {
      const report = db.communityReports.find((r) => r.id === req.params.id);
      if (!report) return { error: 'Reporte no encontrado', status: 404 };

      const wasVoted = !!report.helpfulVotedByMe;
      report.helpfulVotedByMe = !wasVoted;
      report.helpfulCount = wasVoted
        ? Math.max(0, report.helpfulCount - 1)
        : report.helpfulCount + 1;

      return report;
    });

    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el voto' });
  }
});

// ---------------- LOGIN ----------------

app.post('/api/login', async (req, res) => {
  try {
    const { code, password } = req.body;
    const cleanCode = String(code || '').trim().toLowerCase();
    const db = await readDb();

    const user = db.users.find(
      (u) =>
        (u.code.toLowerCase() === cleanCode ||
          u.email.toLowerCase() === cleanCode) &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Código o contraseña incorrectos' });
    }

    const { password: _omit, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

// ---------------- LIDERMAN ----------------

app.get('/api/liderman/rounds', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.lidermanRounds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las rondas' });
  }
});

app.get('/api/liderman/history', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.lidermanHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cargar el historial' });
  }
});

app.post('/api/liderman/history', async (req, res) => {
  try {
    const result = await updateDb((db) => {
      const now = new Date();
      const newEntry = {
        id: `lrep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: now.toISOString().slice(0, 10),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`,
        supervisorChecked: false,
        ...req.body,
      };

      db.lidermanHistory.unshift(newEntry);
      return newEntry;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo guardar el reporte de Liderman' });
  }
});

// ---------------- GAMIFICACIÓN ----------------

const BADGE_RULES = [
  { id: 'first_report', targetRole: 'student', requiredCount: 1, pointsReward: 15 },
  { id: 'plug_hunter', targetRole: 'student', requiredCount: 5, pointsReward: 25 },
  { id: 'explorer', targetRole: 'student', requiredCount: 5, pointsReward: 40 },
  { id: 'photo_master', targetRole: 'student', requiredCount: 5, pointsReward: 35 },
  { id: 'observer', targetRole: 'student', requiredCount: 10, pointsReward: 30 },
  { id: 'streak_fire', targetRole: 'both', requiredCount: 7, pointsReward: 50 },
  { id: 'study_guardian', targetRole: 'student', requiredCount: 50, pointsReward: 75 },
  { id: 'hero', targetRole: 'student', requiredCount: 100, pointsReward: 150 },
  { id: 'first_official', targetRole: 'liderman', requiredCount: 1, pointsReward: 20 },
  { id: 'punctual', targetRole: 'liderman', requiredCount: 6, pointsReward: 60 },
  { id: 'watchman', targetRole: 'liderman', requiredCount: 10, pointsReward: 50 },
  { id: 'campus_guardian', targetRole: 'liderman', requiredCount: 30, pointsReward: 120 },
];

const POINTS_PER_REPORT = 10;

app.post('/api/gamification/:userId/award-report', async (req, res) => {
  try {
    const result = await updateDb((db) => {
      const user = db.users.find((u) => u.id === req.params.userId);
      if (!user || !user.gamification) {
        return { error: 'Usuario no encontrado', status: 404 };
      }

      const gam = user.gamification;
      gam.reportsCount += 1;
      gam.points += POINTS_PER_REPORT;
      gam.dailyPointsEarned = Math.min(
        gam.dailyPointsMax,
        gam.dailyPointsEarned + POINTS_PER_REPORT
      );

      const newlyUnlocked = [];
      for (const rule of BADGE_RULES) {
        const appliesToUser =
          rule.targetRole === 'both' || rule.targetRole === user.role;
        const alreadyUnlocked = gam.unlockedBadges.includes(rule.id);

        if (
          appliesToUser &&
          !alreadyUnlocked &&
          gam.reportsCount >= rule.requiredCount
        ) {
          gam.unlockedBadges.push(rule.id);
          gam.points += rule.pointsReward;
          newlyUnlocked.push(rule.id);
        }
      }

      gam.level = 1 + Math.floor(gam.points / 100);

      const { password: _omit, ...safeUser } = user;
      return { user: safeUser, newlyUnlocked };
    });

    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar la gamificación' });
  }
});

// ---------------- ARRANQUE ----------------

async function start() {
  // En Render, comprobamos que PostgreSQL esté disponible antes
  // de empezar a aceptar tráfico.
  if (pool) {
    await ensurePostgres();
    console.log('✅ PostgreSQL de Render conectado.');
  }

  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`✅ Servidor de AforoPUCP escuchando en http://localhost:${PORT}`);
    });
  }
}

start().catch((error) => {
  console.error('❌ Error iniciando el servidor:', error);
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

export default app;
