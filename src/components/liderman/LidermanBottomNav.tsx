import React from 'react';
import { LayoutDashboard, Radio, History, User, PlusCircle } from 'lucide-react';
import { LidermanTab } from '../../types';

interface LidermanBottomNavProps {
  activeTab: LidermanTab;
  onChangeTab: (tab: LidermanTab) => void;
  pendingRoundsCount: number;
}

export const LidermanBottomNav: React.FC<LidermanBottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingRoundsCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as LidermanTab,
      label: 'Panel',
      icon: LayoutDashboard,
    },
    {
      id: 'report' as LidermanTab,
      label: 'Reportar',
      icon: Radio,
      highlight: true,
      badge: pendingRoundsCount > 0 ? `${pendingRoundsCount} pendientes` : undefined,
    },
    {
      id: 'history' as LidermanTab,
      label: 'Historial',
      icon: History,
    },
    {
      id: 'profile' as LidermanTab,
      label: 'Perfil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                id="btn-liderman-tab-report"
                onClick={() => onChangeTab(tab.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white ring-4 ring-slate-900 scale-105 shadow-cyan-500/30'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-700 text-white ring-4 ring-slate-900 group-hover:scale-105 shadow-blue-500/30'
                  }`}
                >
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <span
                  className={`text-[11px] font-extrabold mt-1 tracking-tight ${
                    isActive ? 'text-cyan-400' : 'text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
                {pendingRoundsCount > 0 && (
                  <span className="absolute -top-1 right-0 w-3 h-3 bg-amber-500 rounded-full ring-2 ring-slate-900"></span>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`btn-liderman-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
