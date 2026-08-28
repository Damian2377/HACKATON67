import React from 'react';
import {
  X,
  Award,
  Sparkles,
  Zap,
  Monitor,
  BookOpen,
  MapPin,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Building, Floor } from '../types';

interface PitchModalProps {
  biblioCentral: Building;
  onClose: () => void;
  onOpenMap: (building: Building) => void;
  onSelectFloor: (building: Building, floor: Floor) => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({
  biblioCentral,
  onClose,
  onOpenMap,
  onSelectFloor,
}) => {
  const floor2 = biblioCentral.floors.find((f) => f.floorNumber === 2) || biblioCentral.floors[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <div>
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Pitch Deck Showcase • AforoPUCP
              </h3>
              <p className="text-[11px] text-amber-700">La pantalla clave para convencer jurados e inversionistas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pitch Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Pitch Title Centered */}
          <div className="text-center space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-black tracking-wider uppercase mb-1">
              AFOROPUCP
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">
              Encuentra dónde estudiar
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              El alumno pasa de la incertidumbre al asiento en 5 segundos
            </p>
          </div>

          {/* Mini Search Placeholder */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-2 font-medium">
              <span>🔎</span> ¿Qué necesitas? (1 persona, enchufe, silencio)
            </span>
            <span className="text-cyan-700 font-bold text-[11px]">Listo ✓</span>
          </div>

          {/* The Pitch Centerpiece Card from Prompt:
              ┌─────────────────────────┐
              │ 📚 Biblioteca Central    │
              │                         │
              │ Piso 1       🔴 87%     │
              │ Piso 2       🟢 25%     │
              │ Piso 3       🟡 61%     │
              │                         │
              │ 🔌 8     💻 4    📚 3   │
              │                         │
              │ 🤖 Mejor opción: Piso 2 │
              └─────────────────────────┘
          */}
          <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-5 border-2 border-slate-900 shadow-xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-700 text-white flex items-center justify-center text-base font-bold shadow-xs">
                  📚
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    Biblioteca Central
                  </h3>
                  <span className="text-[11px] text-slate-500">Campus San Miguel</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Piso 2 libre
              </span>
            </div>

            {/* Piso breakdown with progress lines */}
            <div className="space-y-2.5 text-xs font-bold">
              {biblioCentral.floors.map((floor) => {
                const isWinner = floor.floorNumber === 2;
                return (
                  <div
                    key={floor.id}
                    onClick={() => onSelectFloor(biblioCentral, floor)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isWinner
                        ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display">Piso {floor.floorNumber}</span>
                      {isWinner && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded">
                          Vacío
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span>
                        {floor.occupancyPercent <= 40
                          ? '🟢'
                          : floor.occupancyPercent <= 75
                          ? '🟡'
                          : '🔴'}
                      </span>
                      <span>{floor.occupancyPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resources row: 🔌 8   💻 4   📚 3 */}
            <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-white rounded-2xl border border-slate-200/90 text-center text-xs font-extrabold text-slate-900">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-amber-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-base font-black">8</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">enchufes</span>
              </div>

              <div className="flex flex-col items-center border-x border-slate-100">
                <div className="flex items-center gap-1 text-indigo-600">
                  <Monitor className="w-4 h-4" />
                  <span className="text-base font-black">4</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">PCs</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-base font-black">3</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">cubículos</span>
              </div>
            </div>

            {/* 🤖 Mejor opción: Piso 2 */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-base">🤖</span>
                <span>Mejor opción: <strong>Piso 2 (25% ocupado)</strong></span>
              </div>
              <span className="text-[11px] text-cyan-300 font-bold">Recomendado</span>
            </div>
          </div>

          {/* Comparison Narrative Box */}
          <div className="bg-slate-100/90 rounded-2xl p-4 space-y-2 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Impacto Inmediato
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-rose-900">
                <span className="font-bold block text-[11px] uppercase text-rose-700">Antes</span>
                <p className="mt-1 font-medium">"¿Dónde habrá sitio?" 😵💫 (20 min subiendo escaleras)</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900">
                <span className="font-bold block text-[11px] uppercase text-emerald-700">Ahora</span>
                <p className="mt-1 font-extrabold">"Piso 2: 25%, 8 enchufes y 3 cubículos." 😎</p>
              </div>
            </div>
          </div>

          {/* Action Button: 🗺️ VER EN EL MAPA */}
          <button
            id="btn-pitch-ver-mapa"
            onClick={() => {
              onOpenMap(biblioCentral);
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>🗺️ VER EN EL MAPA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
