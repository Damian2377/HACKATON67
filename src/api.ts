// ============================================================
// API del frontend
// ------------------------------------------------------------
// Este archivo junta en un solo lugar todas las llamadas al
// servidor (server/index.js). Cada función usa `fetch`, que es
// la forma estándar en JavaScript de pedirle algo a una URL.
// Así, si algo cambia en cómo hablamos con el servidor, solo
// se actualiza aquí, en un único lugar.
// ============================================================
import { Building, CommunityReport, UserAccount, LidermanReportItem } from './types';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error del servidor (${res.status})`);
  }
  return res.json();
}

export const api = {
  getBuildings: (): Promise<Building[]> => fetch('/api/buildings').then((r) => handle(r)),

  updateFloor: (buildingId: string, floorId: string, updates: Record<string, unknown>) =>
    fetch(`/api/buildings/${buildingId}/floors/${floorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then((r) => handle<{ building: Building; floor: unknown }>(r)),

  toggleCubicle: (buildingId: string, cubicleId: string) =>
    fetch(`/api/buildings/${buildingId}/cubicles/${cubicleId}/toggle`, {
      method: 'PUT',
    }).then((r) => handle<{ building: Building }>(r)),

  getReports: (): Promise<CommunityReport[]> => fetch('/api/reports').then((r) => handle(r)),

  addReport: (report: Partial<CommunityReport>): Promise<CommunityReport> =>
    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).then((r) => handle(r)),

  toggleHelpful: (reportId: string): Promise<CommunityReport> =>
    fetch(`/api/reports/${reportId}/helpful`, { method: 'POST' }).then((r) => handle(r)),

  login: (code: string, password: string): Promise<UserAccount> =>
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, password }),
    }).then((r) => handle(r)),

  // Se llama después de guardar cualquier reporte. Devuelve el usuario
  // con sus puntos/insignias actualizados, y la lista de insignias
  // nuevas que se acaban de desbloquear (para mostrar el modal de festejo).
  awardReportPoints: (userId: string): Promise<{ user: UserAccount; newlyUnlocked: string[] }> =>
    fetch(`/api/gamification/${userId}/award-report`, { method: 'POST' }).then((r) => handle(r)),

  getLidermanRounds: () => fetch('/api/liderman/rounds').then((r) => handle(r)),
  getLidermanHistory: () => fetch('/api/liderman/history').then((r) => handle(r)),
  addLidermanHistory: (entry: Partial<LidermanReportItem>) =>
    fetch('/api/liderman/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).then((r) => handle<LidermanReportItem>(r)),
};
