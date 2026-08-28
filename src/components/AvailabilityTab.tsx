import React, { useState } from 'react';
import {
  Building as BuildingIcon,
  Zap,
  BookOpen,
  Monitor,
  VolumeX,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  MapPin,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Building, Floor } from '../types';

interface AvailabilityTabProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelectBuilding: (b: Building) => void;
  onSelectFloor: (b: Building, f: Floor) => void;
  onOpenMapToBuilding: (b: Building) => void;
}

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  onSelectFloor,
  onOpenMapToBuilding,
}) => {
  const currentBuilding = selectedBuilding || buildings[0];

  const getStatusBadge = (percent: number) => {
    if (percent <= 40) {
      return {
        label: 'Disponible',
        dot: '🟢',
        percentText: `${percent}%`,
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
      };
    }
    if (percent <= 75) {
      return {
        label: 'Moderado',
        dot: '🟡',
        percentText: `${percent}%`,
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Saturado',
      dot: '🔴',
      percentText: `${percent}%`,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500',
    };
  };

  const currentGeneralStatus = getStatusBadge(currentBuilding.generalOccupancyPercent);

  return (
    <div className="pb-28 pt-2 px-4 max-w-2xl mx-auto space-y-5">
      {/* 1. Building Selector Tabs */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Seleccionar Edificio
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {buildings.map((b) => {
            const isSelected = b.id === currentBuilding.id;
            const bStatus = getStatusBadge(b.generalOccupancyPercent);
            return (
              <button
                key={b.id}
                id={`btn-select-building-${b.id}`}
                onClick={() => onSelectBuilding(b)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{bStatus.dot}</span>
                <span>{b.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Building Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wide">
                {currentBuilding.type}
              </span>
              {currentBuilding.structureBadge && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {currentBuilding.structureBadge}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">Zona {currentBuilding.campusZone}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1 tracking-tight">
              {currentBuilding.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{currentBuilding.description}</p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Estado general
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border mt-1 ${currentGeneralStatus.colorClass}`}
            >
              <span>{currentGeneralStatus.dot}</span>
              <span>{currentGeneralStatus.label}</span>
              <span className="font-mono">({currentBuilding.generalOccupancyPercent}%)</span>
            </span>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Horario: <strong>{currentBuilding.openingHours}</strong></span>
          </span>
          <button
            onClick={() => onOpenMapToBuilding(currentBuilding)}
            className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ver en mapa</span>
          </button>
        </div>
      </div>

      {/* 3. Problem-solving insight banner */}
      <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Desglose por niveles en tiempo real:</strong> Selecciona un piso o sótano para consultar aforo en vivo, enchufes, dispositivos, cubículos y reportes comunitarios.
        </div>
      </div>

      {/* 4. Floor Cards (PISOS) matching prompt specs */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
            Niveles del edificio ({currentBuilding.floors.length} {currentBuilding.floors.length === 1 ? 'nivel' : 'niveles'})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Toca un nivel para ver detalle</span>
        </div>

        {currentBuilding.floors.map((floor) => {
          const status = getStatusBadge(floor.occupancyPercent);
          const isBestFloor = floor.occupancyPercent <= 30;
          const isDining = currentBuilding.category === 'dining';
          const freeSeats = floor.availableSeats ?? Math.max(0, floor.totalSeats - floor.occupiedSeats);

          return (
            <div
              key={floor.id}
              id={`card-floor-${floor.id}`}
              onClick={() => onSelectFloor(currentBuilding, floor)}
              className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer group hover:shadow-md ${
                isBestFloor
                  ? 'border-emerald-300 ring-2 ring-emerald-500/15'
                  : 'border-slate-200 hover:border-cyan-300'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 font-display uppercase">
                      {floor.levelLabel || (floor.floorNumber < 0 ? `Sótano ${Math.abs(floor.floorNumber)}` : `Piso ${floor.floorNumber}`)}
                    </span>
                    {isBestFloor && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                        ⭐ Mejor opción
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{floor.floorName.split('-')[1]?.trim() || floor.floorName}</p>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>{status.dot}</span>
                  <span className={status.colorClass.split(' ')[0]}>
                    {floor.occupancyPercent}% ocupado
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${status.barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${floor.occupancyPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Resource Counters: 🔌 Enchufes, 📚 Cubículos, 💻 PCs (or 🪑 Asientos for dining) */}
              {!isDining ? (
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                        {floor.availablePlugs}
                      </span>
                      <span className="text-[11px] text-slate-500">enchufes libres</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                        {floor.cubicles.filter((c) => !c.isOccupied).length}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {floor.cubicles.length === 1 ? 'cubículo' : 'cubículos'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                        {floor.availableComputers}
                      </span>
                      <span className="text-[11px] text-slate-500">PCs</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      🪑
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                        {freeSeats} libres
                      </span>
                      <span className="text-[11px] text-slate-500">de {floor.totalSeats} asientos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-sm shrink-0">
                      🍽️
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                        {floor.noiseLevel}
                      </span>
                      <span className="text-[11px] text-slate-500">Ambiente de estancia</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom footer */}
              <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Actualizado hace {floor.lastUpdatedMinutesAgo} min
                </span>
                <span className="text-cyan-700 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Ver detalle de piso
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
