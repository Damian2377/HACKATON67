import React from 'react';
import { Home, Map, BarChart3, User, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenAiFinder: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAiFinder,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Inicio', icon: Home },
    { id: 'map' as ActiveTab, label: 'Mapa', icon: Map },
    { id: 'availability' as ActiveTab, label: 'Disponib.', icon: BarChart3 },
    { id: 'profile' as ActiveTab, label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 safe-area-bottom shadow-lg">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-800 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-cyan-50 text-cyan-800' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-cyan-700 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
