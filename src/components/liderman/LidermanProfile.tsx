import React, { useState } from 'react';
import {
  Shield,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  Award,
  Phone,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Trophy,
  Sparkles,
  Lock,
  Check,
  ChevronRight,
} from 'lucide-react';
import { UserAccount, LidermanReportItem, Badge } from '../../types';
import { ALL_BADGES } from '../../data/gamificationData';

interface LidermanProfileProps {
  user: UserAccount;
  historyCount: number;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
  onOpenRanking?: () => void;
}

export const LidermanProfile: React.FC<LidermanProfileProps> = ({
  user,
  historyCount,
  onLogout,
  onSwitchToStudentView,
  onOpenRanking,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const lidermanBadges = ALL_BADGES.filter(
    (b) => b.targetRole === 'liderman' || b.targetRole === 'both'
  );
  const unlockedBadges = lidermanBadges.filter((b) => b.unlocked);

  const points = user.gamification?.points || 420;

  return (
    <div className="pb-28 pt-3 px-4 max-w-2xl mx-auto space-y-5">
      {/* Officer Credential Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/40 text-cyan-300 border border-blue-400/40 flex items-center justify-center font-black text-xl shadow-inner">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl font-display text-white">
                  {user.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                  LIDERMAN
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Código: {user.code}
              </p>
              <p className="text-[11px] text-slate-400">
                {user.facultyOrUnit || 'Seguridad y Vigilancia Campus PUCP'}
              </p>
            </div>
          </div>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-amber-300 block font-mono">
              {points}
            </span>
            <span className="text-[10px] text-slate-300">Puntos</span>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-cyan-300 block font-mono">
              {historyCount}
            </span>
            <span className="text-[10px] text-slate-300">Reportes</span>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-emerald-300 block font-mono">
              98.5%
            </span>
            <span className="text-[10px] text-slate-300">Cumplimiento</span>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-amber-300 block font-mono">
              ⭐ 5.0
            </span>
            <span className="text-[10px] text-slate-300">Puntualidad</span>
          </div>
        </div>
      </div>

      {/* Action: Open Leaderboard Ranking */}
      {onOpenRanking && (
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-blue-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white font-display">
                  Ranking Oficial Liderman PUCP
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                  #2 en Campus
                </span>
              </div>
              <p className="text-xs text-slate-300">
                420 pts acumulados por rondas puntuales y fotos verificadas
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRanking}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1 shrink-0"
          >
            <span>Ver Ranking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Badges of Guard / Liderman */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-700" />
              Insignias Oficiales de Vigilancia
            </h2>
            <p className="text-xs text-slate-500">
              Reconocimiento por cobertura y verificación en campus
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900">
            {unlockedBadges.length} / {lidermanBadges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {lidermanBadges.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBadge(b)}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{b.icon}</span>
                <span className="font-bold text-xs text-slate-900 truncate">{b.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                {b.description}
              </p>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                <Check className="w-3 h-3" /> Desbloqueada
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5 text-xs">
        <h2 className="font-extrabold text-sm text-slate-900 font-display">
          Detalles de Servicio & Asignación
        </h2>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Zona asignada:
            </span>
            <span className="font-bold text-slate-900">
              {user.assignedZone || 'Zona Centro PUCP'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Turno actual:
            </span>
            <span className="font-bold text-slate-900">
              {user.shift || 'Tarde (14:00 - 22:00)'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Puntos de control:
            </span>
            <span className="font-bold text-slate-900">
              Biblioteca Central, CIA, Tinkuy
            </span>
          </div>
        </div>
      </div>

      {/* Campus Emergency / Security Hotline */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300">
            Central de Emergencias & Seguridad PUCP
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          En caso de incidencias en salas o aglomeraciones inusuales, comunicar de inmediato a la Central de Operaciones.
        </p>
        <div className="flex items-center justify-between pt-1 font-mono text-xs">
          <span className="text-slate-400">Anexo interno: <strong>5555</strong></span>
          <span className="text-cyan-300 font-bold">Línea directa: (01) 626-2000</span>
        </div>
      </div>

      {/* Action Buttons: Logout and Switch to student view for testing */}
      <div className="space-y-2.5 pt-2">
        <button
          id="btn-liderman-logout"
          onClick={onLogout}
          className="w-full py-3.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión de guardia</span>
        </button>

        <button
          onClick={onSwitchToStudentView}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <User className="w-3.5 h-3.5" />
          <span>Probar vista de estudiante</span>
        </button>
      </div>

      {/* Badge Inspection Dialog */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-slate-200 text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl">{selectedBadge.icon}</div>
            <h4 className="font-extrabold text-base text-slate-900">
              {selectedBadge.name}
            </h4>
            <p className="text-xs text-slate-600">{selectedBadge.description}</p>
            <div className="p-2.5 bg-blue-50 rounded-xl text-xs font-bold text-blue-900 border border-blue-200">
              Recompensa oficial: +{selectedBadge.pointsReward} Pts
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
