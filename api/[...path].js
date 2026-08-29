// Este archivo es lo que Vercel realmente ejecuta.
// El nombre "[...path]" es especial: le dice a Vercel que TODAS las
// direcciones que empiecen con /api/ (ej. /api/buildings, /api/login,
// /api/reports/123/helpful, etc.) deben pasar por aquí.
//
// No repetimos la lógica del servidor: simplemente reusamos el mismo
// programa Express que ya está en server/index.js, tal cual como
// funciona en tu compu.
import app from '../server/index.js';

export default app;
