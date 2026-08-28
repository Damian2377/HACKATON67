import React from 'react';
import { Shield, LogOut, Bell, CheckCircle, Radio } from 'lucide-react';
import { UserAccount } from '../../types';

interface LidermanHeaderProps {
  user: UserAccount;
  onLogout: () => void;
}

export const LidermanHeader: React.FC<LidermanHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Liderman Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-inner">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-tight text-white text-base sm:text-lg">
                AFORO<span className="text-cyan-400">PUCP</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                LIDERMAN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Supervisión de Aforo & Vigilancia Campus PUCP
            </p>
          </div>
        </div>

        {/* Right side: Guard info & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-slate-200 block">{user.name}</span>
            <span className="text-[10px] text-cyan-400 font-mono">{user.code}</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
