import React from 'react';
import { X, Bell, Zap, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Building, Floor } from '../types';

interface NotificationDrawerProps {
  onClose: () => void;
  onSelectFloor: (building: Building, floor: Floor) => void;
  buildings: Building[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  onClose,
  onSelectFloor,
  buildings,
}) => {
  const biblioCentral = buildings.find((b) => b.id === 'biblio-central') || buildings[0];
  const tinkuy = buildings.find((b) => b.id === 'tinkuy-estudiantil') || buildings[3];
  const cia = buildings.find((b) => b.id === 'cia-innovacion') || buildings[2];

  const bcFloor2 = biblioCentral?.floors.find((f) => f.floorNumber === 2) || biblioCentral?.floors[0];
  const tkFloor2 = tinkuy?.floors.find((f) => f.floorNumber === 2) || tinkuy?.floors[0];

  const notifications = [
    {
      id: 'notif-1',
      title: '¡Cubículo disponible en Biblioteca Central!',
      desc: 'Cubículo 204 (2 personas) en Piso 2 acaba de quedar libre.',
      time: 'Hace 2 min',
      icon: BookOpen,
      iconColor: 'text-emerald-600 bg-emerald-50',
      action: () => bcFloor2 && onSelectFloor(biblioCentral, bcFloor2),
    },
    {
      id: 'notif-2',
      title: 'Baja afluencia en Tinkuy',
      desc: 'Piso 2 cuenta con 9 enchufes disponibles y ambiente silencioso.',
      time: 'Hace 8 min',
      icon: Zap,
      iconColor: 'text-amber-600 bg-amber-50',
      action: () => tkFloor2 && onSelectFloor(tinkuy, tkFloor2),
    },
    {
      id: 'notif-3',
      title: 'Alerta de aforo: Sala H (CIA)',
      desc: 'Aforo al 91%. Te recomendamos subir a la Terraza Piso 4 (45%).',
      time: 'Hace 15 min',
      icon: Bell,
      iconColor: 'text-rose-600 bg-rose-50',
      action: () => onSelectFloor(cia, cia.floors[3] || cia.floors[0]),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl p-5 overflow-y-auto space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-800" />
              <h3 className="font-extrabold text-base text-slate-900 font-display">
                Notificaciones en vivo
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    n.action();
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-cyan-300 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${n.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {n.time}
                    </span>
                    <span className="text-cyan-700 font-bold">Ver espacio →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
