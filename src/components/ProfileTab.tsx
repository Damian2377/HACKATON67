import React, { useState } from 'react';
import {
  User,
  Shield,
  Bookmark,
  Clock,
  Zap,
  TrendingDown,
  Bell,
  Sparkles,
  Award,
  ChevronRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Trophy,
  Flame,
  Camera,
  Star,
  Lock,
  Check,
} from 'lucide-react';
import { UserRole, Building, Floor, Badge } from '../types';
import { ALL_BADGES } from '../data/gamificationData';

interface ProfileTabProps {
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenReportModal: () => void;
  onOpenRanking?: () => void;
  onSelectFloor: (building: Building, floor: Floor) => void;
  buildings: Building[];
  userPoints?: number;
  userReportsCount?: number;
  unlockedBadgeIds?: string[];
  onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userRole,
  onToggleRole,
  onOpenReportModal,
  onOpenRanking = () => {},
  onSelectFloor,
  buildings,
  userPoints = 175,
  userReportsCount = 14,
  unlockedBadgeIds = [],
  onLogout,
}) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const biblioCentral = buildings.find((b) => b.id === 'biblio-central') || buildings[0];
  const tinkuy = buildings.find((b) => b.id === 'tinkuy-estudiantil') || buildings[3];

  const bcFloor2 =
    biblioCentral?.floors.find((f) => f.floorNumber === 2) || biblioCentral?.floors[0];
  const tkFloor2 =
    tinkuy?.floors.find((f) => f.floorNumber === 2) || tinkuy?.floors[0];

  const studentBadges = ALL_BADGES.filter(
    (b) => b.targetRole === 'student' || b.targetRole === 'both'
  );
  const unlockedCount = studentBadges.filter((b) => unlockedBadgeIds.includes(b.id)).length;

  // Level calculation: 0-75 (Nivel 1), 76-150 (Nivel 2), 151-250 (Nivel 3: Explorador), 251-400 (Nivel 4: Guardián), 400+ (Nivel 5: Héroe)
  const currentLevel = userPoints < 75 ? 1 : userPoints < 150 ? 2 : userPoints < 250 ? 3 : userPoints < 400 ? 4 : 5;
  const nextLevelTarget = currentLevel === 1 ? 75 : currentLevel === 2 ? 150 : currentLevel === 3 ? 250 : currentLevel === 4 ? 400 : 500;
  const currentLevelBase = currentLevel === 1 ? 0 : currentLevel === 2 ? 75 : currentLevel === 3 ? 150 : currentLevel === 4 ? 250 : 400;
  const levelProgress = Math.min(100, Math.round(((userPoints - currentLevelBase) / (nextLevelTarget - currentLevelBase)) * 100));
  const pointsNeeded = Math.max(0, nextLevelTarget - userPoints);

  return (
    <div className="pb-28 pt-2 px-4 max-w-2xl mx-auto space-y-5">
      {/* Student Identity Card with Gamification Level */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-800 text-white font-black flex items-center justify-center text-xl shadow-inner border border-cyan-400/30">
              HV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg font-display">
                  Herny Vargas
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                  Nivel {currentLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Código: <span className="font-mono text-cyan-200">20214589</span> • Ing. Informática
              </p>
            </div>
          </div>

          <button
            onClick={onToggleRole}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              userRole === 'liderman'
                ? 'bg-blue-600 text-white border border-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {userRole === 'liderman' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-cyan-300" />
                <span>Modo Guardia</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Modo Alumno</span>
              </>
            )}
          </button>
        </div>

        {/* Level Progress Bar & Points to next badge */}
        <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-slate-200">
                Nivel {currentLevel} • Explorador PUCP
              </span>
            </div>
            <span className="font-mono font-black text-amber-300">
              {userPoints} / {nextLevelTarget} pts
            </span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-cyan-200 font-medium text-right">
            ¡Te faltan <strong>{pointsNeeded} puntos</strong> para subir a Nivel {currentLevel + 1}!
          </p>
        </div>

        {/* Impact stats (Points, Reports, Streak, Reputation) */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-amber-300 block font-mono">
              {userPoints}
            </span>
            <span className="text-[10px] text-slate-300">Puntos</span>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-emerald-300 block font-mono">
              {userReportsCount}
            </span>
            <span className="text-[10px] text-slate-300">Reportes</span>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-orange-400 block font-mono flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 inline" /> 4d
            </span>
            <span className="text-[10px] text-slate-300">Racha</span>
          </div>
          <div className="bg-white/5 p-2 rounded-2xl border border-white/5">
            <span className="text-base sm:text-lg font-black text-cyan-300 block font-mono">
              {unlockedCount}/{studentBadges.length}
            </span>
            <span className="text-[10px] text-slate-300">Insignias</span>
          </div>
        </div>
      </div>

      {/* Action: Open Leaderboard Ranking */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900 font-display">
                Ranking AforoPUCP
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                #4 en Campus
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Estás a 65 pts del Top 3 de alumnos colaboradores
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRanking}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
        >
          <span>Ver Ranking</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Gamification: Badges Gallery */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
                Insignias y Logros PUCP
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {unlockedCount} de {studentBadges.length} insignias desbloqueadas
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            {unlockedCount} Ganadas
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {studentBadges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative group ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-200 hover:border-amber-400 hover:shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 opacity-65 hover:opacity-90'
                }`}
              >
                <div className="text-2xl mb-1 flex items-center justify-center">
                  {isUnlocked ? (
                    <span className="transition-transform group-hover:scale-110">
                      {badge.icon}
                    </span>
                  ) : (
                    <div className="relative">
                      <span className="filter grayscale opacity-50">{badge.icon}</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute -bottom-1 -right-1" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-black text-slate-900 truncate">
                  {badge.name}
                </h4>

                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                  {badge.description}
                </p>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-center gap-1 text-[10px] font-bold">
                  {isUnlocked ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Desbloqueada
                    </span>
                  ) : (
                    <span className="text-amber-700 font-mono">
                      +{badge.pointsReward} pts
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action: New Capacity report */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 font-display">
                Reportes Colaborativos de Aforo
              </h3>
              <p className="text-xs text-slate-500">
                Gana hasta +20 puntos por cada reporte con foto y comentario
              </p>
            </div>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            Nuevo reporte
          </button>
        </div>
      </div>

      {/* Saved favorite spots */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
          ⭐ Mis Espacios Favoritos Guardados
        </h3>

        <div className="space-y-2">
          {/* Favorite 1 */}
          {bcFloor2 && (
            <div
              onClick={() => onSelectFloor(biblioCentral, bcFloor2)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  BC
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Biblioteca Central — Piso 2</h4>
                  <p className="text-xs text-slate-500">Silencio • 8 enchufes • 3 cubículos libres</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                🟢 25%
              </span>
            </div>
          )}

          {/* Favorite 2 */}
          {tkFloor2 && (
            <div
              onClick={() => onSelectFloor(tinkuy, tkFloor2)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  TK
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Tinkuy — Piso 2 (Sala Silenciosa)</h4>
                  <p className="text-xs text-slate-500">Luz tenue • 9 enchufes libres</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                🟢 28%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hourly Busy Times (Curva de afluencia típica PUCP) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 font-display">
              Afluencia típica del Campus por Horas
            </h3>
            <p className="text-xs text-slate-500">Hoy: Horas punta entre 12:00 y 16:00</p>
          </div>
          <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md">
            Miércoles
          </span>
        </div>

        {/* Mini hourly chart */}
        <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-4 px-1">
          {[
            { hour: '8h', val: 20, isNow: false },
            { hour: '10h', val: 45, isNow: false },
            { hour: '12h', val: 85, isNow: false },
            { hour: '14h', val: 92, isNow: true },
            { hour: '16h', val: 78, isNow: false },
            { hour: '18h', val: 60, isNow: false },
            { hour: '20h', val: 30, isNow: false },
          ].map((bar) => (
            <div key={bar.hour} className="flex flex-col items-center gap-1 h-full justify-end">
              <div
                className={`w-full rounded-lg transition-all ${
                  bar.isNow
                    ? 'bg-rose-500 ring-2 ring-rose-200'
                    : bar.val > 75
                    ? 'bg-amber-400'
                    : 'bg-cyan-600'
                }`}
                style={{ height: `${bar.val}%` }}
              ></div>
              <span
                className={`text-[10px] font-mono ${
                  bar.isNow ? 'font-black text-rose-600' : 'text-slate-400'
                }`}
              >
                {bar.hour}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications toggle & System Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Bell className="w-4 h-4 text-slate-500" />
            <span>Alertas de sitios libres</span>
          </div>
          <input
            type="checkbox"
            checked={alertsEnabled}
            onChange={() => setAlertsEnabled(!alertsEnabled)}
            className="w-4 h-4 text-cyan-700 rounded cursor-pointer"
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Avisar cuando un cubículo de mi lista de favoritos quede libre en Biblioteca Central o Tinkuy.
        </p>
      </div>

      {/* Logout button */}
      {onLogout && (
        <button
          id="btn-student-logout"
          onClick={onLogout}
          className="w-full py-3.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Cerrar sesión (Salir a Inicio de Sesión)</span>
        </button>
      )}

      {/* Badge Details Inspection Dialog */}
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
            <div className="p-2.5 bg-amber-50 rounded-xl text-xs font-bold text-amber-900 border border-amber-200">
              Recompensa: +{selectedBadge.pointsReward} Puntos de Reputación
            </div>
            {unlockedBadgeIds.includes(selectedBadge.id) && (
              <p className="text-[11px] text-emerald-700 font-bold">✓ Desbloqueada</p>
            )}
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
