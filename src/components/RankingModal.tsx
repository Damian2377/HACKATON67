import React, { useState } from 'react';
import {
  Trophy,
  X,
  Medal,
  Award,
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  User,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { LeaderboardUser, UserRole } from '../types';
import { STUDENT_LEADERBOARD, LIDERMAN_LEADERBOARD } from '../data/gamificationData';

interface RankingModalProps {
  initialRole?: UserRole;
  onClose: () => void;
  userPoints?: number;
  userRank?: number;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  initialRole = 'student',
  onClose,
  userPoints = 175,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  const leaderboard: LeaderboardUser[] =
    selectedRole === 'student' ? STUDENT_LEADERBOARD : LIDERMAN_LEADERBOARD;

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const rest = leaderboard.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-display">
                  Ranking AforoPUCP
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase">
                  Semanal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Los mayores colaboradores de la comunidad del campus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Segmented Tabs (Estudiantes vs. Liderman) */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setSelectedRole('student')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>👨‍🎓 Estudiantes</span>
            </button>

            <button
              onClick={() => setSelectedRole('liderman')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'liderman'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>👮 Vigilancia Liderman</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Podium for Top 3 */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-md border border-slate-700 space-y-4">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" />
                Podio de Honor
              </span>
              <span className="text-[11px] text-slate-400">Puntos acumulados</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 items-end">
              {/* 2nd Place */}
              {top2 && (
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-700 border-2 border-slate-300 text-white flex items-center justify-center font-black text-sm">
                      {top2.avatar}
                    </div>
                    <span className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-black text-[11px] flex items-center justify-center shadow-xs">
                      2
                    </span>
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-bold truncate">{top2.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-amber-300 font-mono font-black">{top2.points} pts</p>
                  </div>
                  <div className="w-full bg-slate-700/60 h-14 rounded-t-xl flex items-center justify-center text-xs font-bold text-slate-300">
                    🥈 2do
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top1 && (
                <div className="flex flex-col items-center text-center space-y-1.5 -mt-3">
                  <div className="relative">
                    <Crown className="w-5 h-5 text-amber-400 mx-auto mb-0.5 animate-bounce" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 border-2 border-amber-300 flex items-center justify-center font-black text-base shadow-lg">
                      {top1.avatar}
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] flex items-center justify-center shadow-xs">
                      1
                    </span>
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-extrabold truncate text-white">{top1.name.split(' ')[0]}</p>
                    <p className="text-xs text-amber-300 font-mono font-black">{top1.points} pts</p>
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-600 to-amber-500 text-amber-950 h-20 rounded-t-xl flex flex-col items-center justify-center font-extrabold text-xs shadow-md">
                    <span>🥇 1er Lugar</span>
                    <span className="text-[9px] opacity-80">{top1.reportsCount} reportes</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3 && (
                <div className="flex flex-col items-center text-center space-y-1.5">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-700 border-2 border-amber-600 text-white flex items-center justify-center font-black text-sm">
                      {top3.avatar}
                    </div>
                    <span className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                      3
                    </span>
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-bold truncate">{top3.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-amber-300 font-mono font-black">{top3.points} pts</p>
                  </div>
                  <div className="w-full bg-slate-700/60 h-10 rounded-t-xl flex items-center justify-center text-xs font-bold text-slate-300">
                    🥉 3ro
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rest of the Leaderboard list */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Tabla General de Posiciones
            </h4>

            <div className="space-y-1.5">
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    user.isCurrentUser
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-mono font-black text-xs ${
                        user.rank === 1
                          ? 'text-amber-600'
                          : user.rank === 2
                          ? 'text-slate-500'
                          : user.rank === 3
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      #{user.rank}
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center border border-slate-200">
                      {user.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">
                          {user.name}
                        </span>
                        {user.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">
                        {user.codeOrUnit}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-xs text-slate-900 block">
                      {user.points} pts
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {user.reportsCount} reportes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points rules tip box */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <h5 className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ¿Cómo sumar más puntos en AforoPUCP?
            </h5>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1 text-center font-medium">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-black text-cyan-800 block">+10 pts</span>
                <span className="text-slate-500">Reporte base</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-black text-cyan-800 block">+5 pts</span>
                <span className="text-slate-500">Adjuntar foto</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-black text-cyan-800 block">+5 pts</span>
                <span className="text-slate-500">Comentario</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span>Tu puntaje actual: </span>
            <strong className="text-slate-900 font-mono font-black">{userPoints} pts</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
