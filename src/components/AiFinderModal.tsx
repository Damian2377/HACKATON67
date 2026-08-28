import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Minus,
  Zap,
  Monitor,
  VolumeX,
  BookOpen,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Building, Floor, FinderQuery, RecommendationResult } from '../types';
import { recommendStudySpot } from '../data/pucpCampus';

interface AiFinderModalProps {
  buildings: Building[];
  onClose: () => void;
  onSelectFloor: (building: Building, floor: Floor) => void;
  onOpenMapToBuilding: (building: Building) => void;
}

export const AiFinderModal: React.FC<AiFinderModalProps> = ({
  buildings,
  onClose,
  onSelectFloor,
  onOpenMapToBuilding,
}) => {
  const [step, setStep] = useState<'form' | 'analyzing' | 'result'>('form');

  // Form State matching prompt specifications:
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [needsPlug, setNeedsPlug] = useState<boolean>(true);
  const [needsComputer, setNeedsComputer] = useState<boolean>(false);
  const [needsQuiet, setNeedsQuiet] = useState<boolean>(true);
  const [needsGroup, setNeedsGroup] = useState<boolean>(false);
  const [duration, setDuration] = useState<'30 min' | '1 hora' | '2 horas' | '3+ horas'>('2 horas');

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const handleSearch = () => {
    setStep('analyzing');

    const query: FinderQuery = {
      peopleCount,
      needsPlug,
      needsComputer,
      needsQuiet,
      needsGroup: needsGroup || peopleCount > 1,
      duration,
    };

    setTimeout(() => {
      const result = recommendStudySpot(buildings, query);
      setRecommendation(result);
      setStep('result');

      // Trigger celebratory confetti for finding ideal spot
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 750);
  };

  const handleReset = () => {
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight flex items-center gap-1.5">
                <span>🤖</span> Encuéntrame un lugar
              </h2>
              <p className="text-[11px] text-cyan-200/80 font-normal">
                Asistente Inteligente de Espacios PUCP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <div className="space-y-6">
              {/* Question 1: ¿Cuántas personas? */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  1. ¿Cuántas personas son?
                </label>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
                  <span className="text-sm font-bold text-slate-800">
                    {peopleCount === 1 ? 'Solo yo (Individual)' : `${peopleCount} personas (Grupo)`}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      id="btn-stepper-minus"
                      onClick={() => {
                        const next = Math.max(1, peopleCount - 1);
                        setPeopleCount(next);
                        if (next === 1) setNeedsGroup(false);
                      }}
                      disabled={peopleCount <= 1}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-7 text-center font-extrabold text-base text-slate-900 font-mono">
                      {peopleCount}
                    </span>
                    <button
                      id="btn-stepper-plus"
                      onClick={() => {
                        const next = Math.min(8, peopleCount + 1);
                        setPeopleCount(next);
                        if (next > 1) setNeedsGroup(true);
                      }}
                      disabled={peopleCount >= 8}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question 2: ¿Qué necesitas? Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  2. ¿Qué necesitas indispensablemente?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Enchufe */}
                  <label
                    onClick={() => setNeedsPlug(!needsPlug)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      needsPlug
                        ? 'bg-cyan-50/70 border-cyan-300 text-cyan-950 font-bold ring-1 ring-cyan-400/40 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={needsPlug}
                      onChange={() => {}}
                      className="w-4 h-4 text-cyan-700 rounded border-slate-300 focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>🔌 Enchufe</span>
                    </div>
                  </label>

                  {/* Silencio */}
                  <label
                    onClick={() => setNeedsQuiet(!needsQuiet)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      needsQuiet
                        ? 'bg-cyan-50/70 border-cyan-300 text-cyan-950 font-bold ring-1 ring-cyan-400/40 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={needsQuiet}
                      onChange={() => {}}
                      className="w-4 h-4 text-cyan-700 rounded border-slate-300 focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <VolumeX className="w-4 h-4 text-blue-500" />
                      <span>🔇 Silencio absoluto</span>
                    </div>
                  </label>

                  {/* Computadora */}
                  <label
                    onClick={() => setNeedsComputer(!needsComputer)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      needsComputer
                        ? 'bg-cyan-50/70 border-cyan-300 text-cyan-950 font-bold ring-1 ring-cyan-400/40 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={needsComputer}
                      onChange={() => {}}
                      className="w-4 h-4 text-cyan-700 rounded border-slate-300 focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <Monitor className="w-4 h-4 text-indigo-500" />
                      <span>💻 Computadora</span>
                    </div>
                  </label>

                  {/* Trabajo Grupal */}
                  <label
                    onClick={() => setNeedsGroup(!needsGroup)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      needsGroup
                        ? 'bg-cyan-50/70 border-cyan-300 text-cyan-950 font-bold ring-1 ring-cyan-400/40 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={needsGroup}
                      onChange={() => {}}
                      className="w-4 h-4 text-cyan-700 rounded border-slate-300 focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>👥 Trabajo grupal</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Question 3: ¿Cuánto tiempo? */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  3. ¿Cuánto tiempo planeas estudiar?
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {(['30 min', '1 hora', '2 horas', '3+ horas'] as const).map((opt) => {
                    const isSelected = duration === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setDuration(opt)}
                        className={`py-2.5 px-2 rounded-2xl text-xs font-bold text-center border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Big Search Button */}
              <button
                id="btn-ai-search-submit"
                onClick={handleSearch}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-700 via-blue-800 to-slate-900 hover:from-cyan-800 hover:to-slate-950 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                <span>🔎</span>
                <span>BUSCAR LUGAR IDEAL</span>
              </button>
            </div>
          )}

          {/* STEP 2: ANALYZING ANIMATION */}
          {step === 'analyzing' && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-200 border-t-cyan-700 animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-800">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">
                  Analizando disponibilidad en el campus PUCP...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluando aforo por pisos, cubículos, enchufes y nivel de ruido
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: AI RESULT MATCHING PROMPT SPECIFICATIONS */}
          {step === 'result' && recommendation && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Winner Header Badge */}
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                    <span>🥇</span> Mejor opción
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {recommendation.matchScore}% Match
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    {recommendation.building.name} — {recommendation.floor.levelLabel || (recommendation.floor.floorNumber < 0 ? `Sótano ${Math.abs(recommendation.floor.floorNumber)}` : `Piso ${recommendation.floor.floorNumber}`)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span>🟢</span> {recommendation.floor.occupancyPercent}% ocupado
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      (Aprox. 3 min caminando)
                    </span>
                  </div>
                </div>

                {/* Resource Badges from Prompt:
                    🔌 8 enchufes disponibles
                    💻 4 computadoras
                    📚 3 cubículos
                    🔇 Ruido bajo
                */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-emerald-200/60 text-slate-800 text-xs font-bold">
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>🔌 {recommendation.floor.availablePlugs} enchufes libres</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <Monitor className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>💻 {recommendation.floor.availableComputers} computadoras</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>📚 {recommendation.floor.cubicles.filter((c) => !c.isOccupied).length} cubículos</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <VolumeX className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>🔇 Ruido {recommendation.floor.noiseLevel.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              {/* 🤖 ¿Por qué? Section */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 font-display">
                  <span>🤖</span>
                  <span>¿Por qué recomendamos este lugar?</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  "{recommendation.reason}"
                </p>
              </div>

              {/* Alternative option (if any) */}
              {recommendation.alternativeOption && (
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      🥈 Segunda opción: {recommendation.alternativeOption.building.shortName} (Piso {recommendation.alternativeOption.floor.floorNumber})
                    </span>
                    <span className="text-[11px] text-slate-500">{recommendation.alternativeOption.reason}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectFloor(recommendation.alternativeOption!.building, recommendation.alternativeOption!.floor);
                      onClose();
                    }}
                    className="text-cyan-700 font-bold text-xs hover:underline shrink-0 ml-2"
                  >
                    Ver →
                  </button>
                </div>
              )}

              {/* Action Buttons: [ VER EN MAPA ] [ VER DETALLE DE PISO ] */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-ai-ver-mapa"
                    onClick={() => {
                      onOpenMapToBuilding(recommendation.building);
                      onClose();
                    }}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>VER EN MAPA</span>
                  </button>

                  <button
                    id="btn-ai-ver-piso"
                    onClick={() => {
                      onSelectFloor(recommendation.building, recommendation.floor);
                      onClose();
                    }}
                    className="py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>IR AL PISO {recommendation.floor.floorNumber}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Cambiar preferencias
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
