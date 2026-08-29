// Este script SOLO se ejecuta una vez, a mano, para crear server/db.json
// a partir de los datos de ejemplo que ya tenían en src/data.
// No forma parte de la app en sí: es una herramienta de preparación.
import fs from 'fs';
import path from 'path';
import { INITIAL_BUILDINGS } from '../src/data/pucpCampus';
import { INITIAL_COMMUNITY_REPORTS } from '../src/data/reportsData';
import {
  DEMO_STUDENT_USER,
  DEMO_LIDERMAN_USER,
  INITIAL_LIDERMAN_ROUNDS,
  INITIAL_LIDERMAN_HISTORY,
} from '../src/data/authData';

const db = {
  buildings: INITIAL_BUILDINGS,
  communityReports: INITIAL_COMMUNITY_REPORTS,
  lidermanRounds: INITIAL_LIDERMAN_ROUNDS,
  lidermanHistory: INITIAL_LIDERMAN_HISTORY,
  // "users" es nuestra lista de cuentas válidas para el login real.
  // OJO: en un proyecto real la contraseña NUNCA se guarda así de plano,
  // pero para un hackathon esto es suficiente y fácil de entender.
  users: [
    { ...DEMO_STUDENT_USER, password: 'pucp2024' },
    { ...DEMO_LIDERMAN_USER, password: 'liderman2024' },
  ],
};

const currentDir = path.dirname(new URL(import.meta.url).pathname);
const outPath = path.resolve(currentDir, '../server/db.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(db, null, 2));
console.log('✅ server/db.json creado con', db.buildings.length, 'edificios y', db.communityReports.length, 'reportes.');
