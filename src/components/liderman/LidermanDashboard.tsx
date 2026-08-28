import React from 'react';
import {
  Shield,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin,
  Building2,
  Zap,
  BookOpen,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { UserAccount, LidermanRound, Building, StatusLevel } from '../../types';

interface LidermanDashboardProps {
  user: UserAccount;
  rounds: LidermanRound[];
  buildings: Building[];
  onStartReport: (buildingId?: string, floorNumber?: number) => void;
  onViewHistory: () => void;
}

export const LidermanDashboard: React.FC<LidermanDashboardProps> = ({
  user,
  rounds,
  buildings,
  onStartReport,
  onViewHistory,
}) => {
  const completedRounds = rounds.filter((r) => r.status === 'completed');
  const pendingRounds = rounds.filter((r) => r.status === 'pending');
  const upcomingRounds = rounds.filter((r) => r.status === 'upcoming');

  const totalAssignedRounds = completedRounds.length + pendingRounds.length;
  const compliancePercent =
    totalAssignedRounds > 0
      ? Math.round((completedRounds.length / totalAssignedRounds) * 100)
      : 100;

  const nextPendingRound = pendingRounds[0];
  const lastCompletedRound = completedRounds[completedRounds.length - 1];

  // Buildings in his zone
  const zoneBuildings = buildings.filter(
    (b) =>
      b.id === 'biblio-central' ||
      b.id === 'cia-innovacion' ||
      b.id === 'tinkuy-estudiantil' ||
      b.id === 'eegg-ciencias'
  );

  return (
    <div className="pb-28 pt-3 px-4 max-w-2xl mx-auto space-y-5">
      {/* 1. Header Card: Panel de Reportes & Assigned Guard */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 text-cyan-300 border border-blue-400/40 flex items-center justify-center font-bold text-xl shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl font-display text-white">
                  Panel de Reportes
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                  OFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {user.name} <span className="text-slate-400 font-normal">({user.code})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Assigned zone and shift info */}
        <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-bold text-cyan-300">
              <MapPin className="w-3.5 h-3.5" />
              <span>Zona Asignada:</span>
            </span>
            <span className="font-medium text-white">{user.assignedZone || 'Zona Centro PUCP'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-700/60 text-[11px]">
            <span>Turno: {user.shift || 'Tarde (14:00 - 22:00)'}</span>
            <span className="text-emerald-400 font-bold">● En servicio activo</span>
          </div>
        </div>
      </div>

      {/* 2. Priority Big Action Button: REPORTAR AFORO */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 rounded-3xl p-5 text-white shadow-xl shadow-cyan-900/20 relative overflow-hidden space-y-3">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Ronda en curso</span>
            </div>
            <h2 className="text-xl font-black font-display text-white">
              Reportar Aforo
            </h2>
            <p className="text-xs text-cyan-100 max-w-sm mt-0.5">
              Actualiza en tiempo real el porcentaje de ocupación, enchufes y cubículos de tu ronda.
            </p>
          </div>
        </div>

        <button
          id="btn-liderman-quick-report"
          onClick={() => onStartReport(nextPendingRound?.buildingId, nextPendingRound?.floorNumber)}
          className="w-full py-4 px-5 bg-white text-slate-900 hover:bg-slate-100 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer"
        >
          <Radio className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <span>REGISTRAR NUEVO REPORTE</span>
          <ChevronRight className="w-4 h-4 ml-1 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 3. Section: ESTADO DE MIS REPORTES (Rondas Obligatorias) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-900 font-display">
                Estado de mis reportes
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                Obligatorio
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión periódica de aforo en rondas programadas
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-slate-900 font-mono block">
              {completedRounds.length}/{rounds.length}
            </span>
            <span className="text-[10px] text-slate-400">Completados</span>
          </div>
        </div>

        {/* Obligation notice banner */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Normativa de Supervisión:</strong> Los reportes de aforo son obligatorios cada 2 horas para garantizar que la comunidad universitaria encuentre espacios libres con datos verídicos.
          </p>
        </div>

        {/* Visual Compliance Meter: "Cumplimiento de hoy: 75%" */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Cumplimiento de hoy:</span>
            <span className="font-black text-base font-mono text-cyan-300">
              {compliancePercent}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                compliancePercent >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : compliancePercent >= 60
                  ? 'bg-gradient-to-r from-amber-400 to-cyan-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${compliancePercent}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Último reporte:</span>
              <span className="font-bold text-white">
                {lastCompletedRound ? `${lastCompletedRound.timeSlot} (${lastCompletedRound.buildingName})` : 'Sin registros'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Próximo reporte:</span>
              <span className="font-bold text-amber-300">
                {nextPendingRound ? `${nextPendingRound.timeSlot} - Toca ahora` : 'Al día ✓'}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule of today's rounds */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Cronograma de Rondas de Hoy
          </h3>

          <div className="space-y-2">
            {rounds.map((round) => {
              const isCompleted = round.status === 'completed';
              const isPending = round.status === 'pending';

              return (
                <div
                  key={round.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isPending
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
                      : isCompleted
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : isPending ? '⚠' : '○'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 font-mono">
                          {round.timeSlot}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          {round.buildingName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Piso {round.floorNumber} — {round.zoneName}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isCompleted && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {round.occupancyReported ? `${round.occupancyReported}% registrado` : 'Realizado'}
                      </span>
                    )}

                    {isPending && (
                      <button
                        onClick={() => onStartReport(round.buildingId, round.floorNumber)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Reportar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {round.status === 'upcoming' && (
                      <span className="text-[10px] font-medium text-slate-400">
                        Programado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Quick Zone Buildings Overview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 font-display">
              Edificios en tu Zona Asignada
            </h2>
            <p className="text-xs text-slate-500">Estado en vivo en el campus</p>
          </div>
          <button
            onClick={onViewHistory}
            className="text-xs font-bold text-cyan-700 hover:underline flex items-center gap-0.5"
          >
            <span>Ver historial</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {zoneBuildings.map((b) => (
            <div
              key={b.id}
              onClick={() => onStartReport(b.id, 1)}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-cyan-800">
                  {b.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {b.floors.length} pisos monitoreados
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-md font-mono ${
                    b.status === 'available'
                      ? 'bg-emerald-100 text-emerald-900'
                      : b.status === 'moderate'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {b.generalOccupancyPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
