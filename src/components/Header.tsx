import React from 'react';
import { Bell, Sparkles, Shield, User, Award, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenPitch: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  onToggleRole,
  onOpenPitch,
  onOpenNotifications,
  unreadCount,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Live Pill */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-sm shadow-cyan-900/10">
            <span className="font-display tracking-tight text-base font-extrabold">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-tight text-slate-900 text-lg sm:text-xl">
                AFORO<span className="text-cyan-700">PUCP</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                EN VIVO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Campus San Miguel • Disponibilidad en tiempo real
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Pitch Demo Showcase Button */}
          <button
            id="btn-pitch-mode"
            onClick={onOpenPitch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-all shadow-xs"
            title="Ver pantalla de pitch"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Modo Pitch</span>
          </button>

          {/* Role badge button */}
          <button
            id="btn-toggle-role"
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              userRole === 'liderman'
                ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
            }`}
            title="Alternar entre modo Alumno y Vigilante Liderman"
          >
            {userRole === 'liderman' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-cyan-300" />
                <span>Liderman PUCP</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Alumno</span>
              </>
            )}
          </button>

          {/* Notifications button */}
          <button
            id="btn-notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Ver notificaciones de aforo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* Logout button */}
          {onLogout && (
            <button
              id="btn-header-logout"
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
