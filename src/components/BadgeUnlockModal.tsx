import React from 'react';
import { Award, X, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Badge } from '../types';

interface BadgeUnlockModalProps {
  badge: Badge;
  onClose: () => void;
  onViewAllBadges?: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badge,
  onClose,
  onViewAllBadges,
}) => {
  React.useEffect(() => {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 flex items-center justify-center mx-auto text-4xl shadow-lg border-2 border-amber-200">
          {badge.icon}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            ¡Nueva Insignia Desbloqueada!
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display">
            {badge.name}
          </h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            {badge.description}
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-center gap-2">
          <span>Recompensa:</span>
          <span className="font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
            +{badge.pointsReward} Puntos de Reputación
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => {
              onClose();
              if (onViewAllBadges) onViewAllBadges();
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs"
          >
            Ver mis insignias
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
