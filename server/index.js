// ============================================================
// SERVIDOR (backend) de AforoPUCP
// ------------------------------------------------------------
// ¿Por qué existe esto? Antes, todos los datos (edificios,
// reportes, usuarios) vivían solo en la memoria del navegador
// de cada persona. Este archivo es un programa aparte que:
//   1) Guarda los datos en un archivo (server/db.json), como
//      si fuera una hoja de cálculo compartida.
//   2) Expone "endpoints" (direcciones URL) para que el
//      aplicativo (el frontend) pueda leer y modificar esos
//      datos mediante peticiones HTTP (fetch).
// Así, cuando un estudiante reporta el aforo desde su celular,
// ese cambio se guarda aquí, y CUALQUIER otro celular que
// pregunte por los datos verá el cambio.
// ============================================================

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
app.use(express.json()); // permite leer JSON en el "body" de las peticiones

// Permite que el frontend (que corre en otro puerto durante el desarrollo)
// pueda hacerle peticiones a este servidor sin que el navegador las bloquee.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ---- "Base de datos" muy simple basada en un archivo JSON ----
function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}
function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Recalcula el % general de un edificio a partir de sus pisos.
function recalcBuildingOccupancy(building) {
  const avg = Math.round(
    building.floors.reduce((acc, f) => acc + f.occupancyPercent, 0) / building.floors.length
  );
  building.generalOccupancyPercent = avg;
  building.status = avg >= 85 ? 'saturated' : avg >= 50 ? 'moderate' : 'available';
  building.lastUpdatedMinutesAgo = 0;
  return building;
}

// ---------------- EDIFICIOS Y PISOS ----------------

// Obtener todos los edificios (con sus pisos y cubículos)
app.get('/api/buildings', (req, res) => {
  const db = readDb();
  res.json(db.buildings);
});

// Actualizar el aforo de un piso (lo usa: reporte de estudiante y de liderman)
app.put('/api/buildings/:buildingId/floors/:floorId', (req, res) => {
  const { buildingId, floorId } = req.params;
  const updates = req.body; // ej: { occupancyPercent, availablePlugs, availableComputers }

  const db = readDb();
  const building = db.buildings.find((b) => b.id === buildingId);
  if (!building) return res.status(404).json({ error: 'Edificio no encontrado' });

  const floor = building.floors.find((f) => f.id === floorId);
  if (!floor) return res.status(404).json({ error: 'Piso no encontrado' });

  Object.assign(floor, updates);
  if (updates.occupancyPercent !== undefined) {
    floor.occupiedSeats = Math.round((updates.occupancyPercent / 100) * floor.totalSeats);
  }
  floor.lastUpdatedMinutesAgo = 0;

  recalcBuildingOccupancy(building);
  writeDb(db);
  res.json({ building, floor });
});

// Prender/apagar un cubículo puntual
app.put('/api/buildings/:buildingId/cubicles/:cubicleId/toggle', (req, res) => {
  const { buildingId, cubicleId } = req.params;
  const db = readDb();
  const building = db.buildings.find((b) => b.id === buildingId);
  if (!building) return res.status(404).json({ error: 'Edificio no encontrado' });

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
  if (!updatedCubicle) return res.status(404).json({ error: 'Cubículo no encontrado' });

  writeDb(db);
  res.json({ building });
});

// ---------------- REPORTES DE LA COMUNIDAD ----------------

app.get('/api/reports', (req, res) => {
  const db = readDb();
  res.json(db.communityReports);
});

app.post('/api/reports', (req, res) => {
  const db = readDb();
  const newReport = {
    id: `crep-${Date.now()}`,
    createdAt: Date.now(),
    timestamp: 'Hace un momento',
    verified: false,
    helpfulCount: 0,
    helpfulVotedByMe: false,
    ...req.body,
  };
  db.communityReports.unshift(newReport);
  writeDb(db);
  res.status(201).json(newReport);
});

app.post('/api/reports/:id/helpful', (req, res) => {
  const db = readDb();
  const report = db.communityReports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });

  const wasVoted = !!report.helpfulVotedByMe;
  report.helpfulVotedByMe = !wasVoted;
  report.helpfulCount = wasVoted ? Math.max(0, report.helpfulCount - 1) : report.helpfulCount + 1;

  writeDb(db);
  res.json(report);
});

// ---------------- LOGIN ----------------

app.post('/api/login', (req, res) => {
  const { code, password } = req.body;
  const cleanCode = String(code || '').trim().toLowerCase();
  const db = readDb();
  const user = db.users.find(
    (u) =>
      (u.code.toLowerCase() === cleanCode || u.email.toLowerCase() === cleanCode) &&
      u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: 'Código o contraseña incorrectos' });
  }
  // No devolvemos la contraseña al frontend, por seguridad.
  const { password: _omit, ...safeUser } = user;
  res.json(safeUser);
});

// ---------------- LIDERMAN ----------------

app.get('/api/liderman/rounds', (req, res) => {
  const db = readDb();
  res.json(db.lidermanRounds);
});

app.get('/api/liderman/history', (req, res) => {
  const db = readDb();
  res.json(db.lidermanHistory);
});

app.post('/api/liderman/history', (req, res) => {
  const db = readDb();
  const now = new Date();
  const newEntry = {
    id: `lrep-${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    supervisorChecked: false,
    ...req.body,
  };
  db.lidermanHistory.unshift(newEntry);
  writeDb(db);
  res.status(201).json(newEntry);
});

// ---------------- GAMIFICACIÓN (puntos e insignias) ----------------

// Reglas de insignias: solo lo mínimo que el servidor necesita para
// decidir si desbloquea una. El nombre/ícono/descripción de cada una
// vive en el frontend (src/data/gamificationData.ts), para mostrarlas.
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

// Se llama justo después de guardar un reporte (estudiante o liderman).
// Suma puntos, sube el contador de reportes, y revisa si con ese nuevo
// conteo se desbloquea alguna insignia nueva.
app.post('/api/gamification/:userId/award-report', (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.params.userId);
  if (!user || !user.gamification) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const gam = user.gamification;
  gam.reportsCount += 1;
  gam.points += POINTS_PER_REPORT;
  gam.dailyPointsEarned = Math.min(gam.dailyPointsMax, gam.dailyPointsEarned + POINTS_PER_REPORT);

  const newlyUnlocked = [];
  for (const rule of BADGE_RULES) {
    const appliesToUser = rule.targetRole === 'both' || rule.targetRole === user.role;
    const alreadyUnlocked = gam.unlockedBadges.includes(rule.id);
    if (appliesToUser && !alreadyUnlocked && gam.reportsCount >= rule.requiredCount) {
      gam.unlockedBadges.push(rule.id);
      gam.points += rule.pointsReward;
      newlyUnlocked.push(rule.id);
    }
  }

  // Nivel simple: sube uno cada 100 puntos.
  gam.level = 1 + Math.floor(gam.points / 100);

  writeDb(db);
  const { password: _omit, ...safeUser } = user;
  res.json({ user: safeUser, newlyUnlocked });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor de AforoPUCP escuchando en http://localhost:${PORT}`);
});
