import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Navigation,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  BookOpen,
  ChevronRight,
  Maximize2,
  Info,
} from 'lucide-react';
import { Building, Floor, StatusLevel } from '../types';

interface CampusMapProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onSelectBuilding: (building: Building) => void;
  onViewAvailability: (building: Building) => void;
  onSelectFloor: (building: Building, floor: Floor) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  onViewAvailability,
  onSelectFloor,
}) => {
  const [mapSearch, setMapSearch] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'libraries' | 'plugs'>('all');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getStatusColor = (percent: number) => {
    if (percent <= 40) return { dot: '🟢', color: '#10b981', bgClass: 'bg-emerald-500 text-white border-emerald-300', textClass: 'text-emerald-700', label: 'Disponible' };
    if (percent <= 75) return { dot: '🟡', color: '#f59e0b', bgClass: 'bg-amber-500 text-white border-amber-300', textClass: 'text-amber-700', label: 'Moderado' };
    return { dot: '🔴', color: '#ef4444', bgClass: 'bg-rose-500 text-white border-rose-300', textClass: 'text-rose-700', label: 'Saturado' };
  };

  const getFloorPill = (floor: Floor) => {
    const p = floor.occupancyPercent;
    if (p <= 40) return { icon: '🟢', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (p <= 75) return { icon: '🟡', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { icon: '🔴', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  // Filter buildings
  const displayedBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(mapSearch.toLowerCase()) ||
      b.shortName.toLowerCase().includes(mapSearch.toLowerCase()) ||
      b.code.toLowerCase().includes(mapSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'available') return b.generalOccupancyPercent <= 45;
    if (activeFilter === 'libraries') return b.type === 'Biblioteca';
    if (activeFilter === 'plugs') return b.floors.some((f) => f.availablePlugs >= 4);
    return true;
  });

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-130px)] min-h-[520px] max-h-[820px] bg-slate-100 overflow-hidden flex flex-col select-none">
      {/* Top Search & Filter Floating Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 space-y-2 pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto relative shadow-md rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-map"
            type="text"
            placeholder="Buscar edificio en campus PUCP..."
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {mapSearch && (
            <button
              onClick={() => setMapSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter chips floating */}
        <div className="pointer-events-auto max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white/90 text-slate-700 border border-slate-200'
            }`}
          >
            Todos los edificios
          </button>
          <button
            onClick={() => setActiveFilter('available')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
              activeFilter === 'available'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/90 text-emerald-800 border border-emerald-200'
            }`}
          >
            🟢 Libres (0-40%)
          </button>
          <button
            onClick={() => setActiveFilter('libraries')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
              activeFilter === 'libraries'
                ? 'bg-cyan-700 text-white'
                : 'bg-white/90 text-slate-700 border border-slate-200'
            }`}
          >
            Bibliotecas
          </button>
          <button
            onClick={() => setActiveFilter('plugs')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
              activeFilter === 'plugs'
                ? 'bg-amber-600 text-white'
                : 'bg-white/90 text-amber-800 border border-amber-200'
            }`}
          >
            ⚡ Enchufes libres
          </button>
        </div>
      </div>

      {/* Map Canvas / SVG Interactive PUCP Map */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden bg-[#e8ece9]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Detailed SVG Map of PUCP Campus */}
          <svg
            viewBox="0 0 1000 1000"
            className="w-full h-full min-w-[700px] min-h-[700px]"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            {/* Campus Background Ground */}
            <rect width="1000" height="1000" fill="#e9eeea" />

            {/* Roads & Perimeter: Av. Universitaria (left/west), Av. Riva Agüero (south) */}
            <rect x="0" y="0" width="80" height="1000" fill="#cbd5e1" />
            <text x="35" y="450" fill="#64748b" fontSize="14" fontWeight="bold" transform="rotate(-90 35 450)">
              Av. Universitaria (Ingreso Principal)
            </text>

            <rect x="0" y="930" width="1000" height="70" fill="#cbd5e1" />
            <text x="450" y="965" fill="#64748b" fontSize="14" fontWeight="bold">
              Av. Riva Agüero (Puerta 5 / Deportes)
            </text>

            {/* Campus Green Lawns (Prado Central, Jardines Letras, Canchas) */}
            {/* Prado Central */}
            <path
              d="M 380,320 C 440,300 560,310 600,360 C 620,440 580,520 480,530 C 400,520 360,400 380,320 Z"
              fill="#d1fae5"
              stroke="#a7f3d0"
              strokeWidth="2"
            />
            <text x="490" y="460" fill="#047857" fontSize="13" fontWeight="bold" opacity="0.6" textAnchor="middle">
              🌿 Prado Central PUCP
            </text>

            {/* Jardines EEGG Letras & Ciencias */}
            <rect x="180" y="380" width="90" height="160" rx="16" fill="#dcfce7" stroke="#bbf7d0" />
            <text x="225" y="465" fill="#16a34a" fontSize="11" fontWeight="bold" opacity="0.6" textAnchor="middle">
              Jardines Ciencias
            </text>

            {/* Canchas y Polideportivo (Sur-Este) */}
            <rect x="680" y="650" width="220" height="200" rx="12" fill="#d1fae5" stroke="#99f6e4" />
            <text x="790" y="750" fill="#0f766e" fontSize="13" fontWeight="bold" opacity="0.7" textAnchor="middle">
              ⚽ Canchas Deportivas
            </text>

            {/* Internal Campus Paths (Walkways) */}
            <path
              d="M 80,480 L 300,480 L 480,420 L 720,440 L 920,440"
              stroke="#ffffff"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 480,180 L 480,420 L 500,700 L 500,930"
              stroke="#ffffff"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 280,480 L 250,750 L 500,700 L 720,440"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Main Entrance Marker */}
            <g transform="translate(80, 480)">
              <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="3" />
              <text x="25" y="5" fill="#0369a1" fontSize="12" fontWeight="bold">
                🚪 Puerta Principal (Tinkuy / BC)
              </text>
            </g>

            {/* Student Current Location Simulation */}
            <g transform="translate(180, 480)">
              <circle r="18" fill="#38bdf8" opacity="0.3" className="animate-ping" />
              <circle r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
              <text x="0" y="-14" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                Tú estás aquí (Av. Universitaria)
              </text>
            </g>

            {/* Buildings Rectangles / Layouts for the 7 official locations */}
            {/* 1. CIA — Complejo de Innovación Académica (Este) */}
            <rect
              x="660"
              y="390"
              width="120"
              height="95"
              rx="10"
              fill="#ffffff"
              stroke="#0891b2"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-cyan-500 hover:fill-cyan-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'cia');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="720" y="445" fill="#0e7490" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
              🏢 CIA
            </text>

            {/* 2. Biblioteca de Ciencias Sociales (Oeste) */}
            <rect
              x="200"
              y="390"
              width="115"
              height="95"
              rx="10"
              fill="#ffffff"
              stroke="#0891b2"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-cyan-500 hover:fill-cyan-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'biblio-sociales');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="257" y="445" fill="#0e7490" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
              📚 Bib. Sociales
            </text>

            {/* 3. Biblioteca Central (Centro) */}
            <rect
              x="420"
              y="310"
              width="120"
              height="100"
              rx="10"
              fill="#ffffff"
              stroke="#0891b2"
              strokeWidth="2.5"
              className="cursor-pointer hover:stroke-cyan-500 hover:fill-cyan-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'biblio-central');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="480" y="365" fill="#0369a1" fontSize="12" fontWeight="900" textAnchor="middle" pointerEvents="none">
              🏛️ Bib. Central
            </text>

            {/* 4. Tinkuy (Sur) */}
            <rect
              x="440"
              y="630"
              width="120"
              height="90"
              rx="10"
              fill="#ffffff"
              stroke="#059669"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-emerald-500 hover:fill-emerald-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'tinkuy');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="500" y="680" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
              🌿 Tinkuy
            </text>

            {/* 5. Comedor de Letras (Norte) */}
            <rect
              x="220"
              y="170"
              width="115"
              height="90"
              rx="10"
              fill="#ffffff"
              stroke="#d97706"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-amber-500 hover:fill-amber-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'comedor-letras');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="277" y="220" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
              🍽️ Comedor Letras
            </text>

            {/* 6. Comedor Central (Centro-Sur) */}
            <rect
              x="520"
              y="470"
              width="120"
              height="90"
              rx="10"
              fill="#ffffff"
              stroke="#d97706"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-amber-500 hover:fill-amber-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'comedor-central');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="580" y="520" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
              🍽️ Comedor Central
            </text>

            {/* 7. Comedor de Artes (Sur-Este) */}
            <rect
              x="720"
              y="670"
              width="115"
              height="90"
              rx="10"
              fill="#ffffff"
              stroke="#d97706"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-amber-500 hover:fill-amber-50/50 transition-all"
              onClick={() => {
                const b = buildings.find((x) => x.id === 'comedor-artes');
                if (b) onSelectBuilding(b);
              }}
            />
            <text x="777" y="720" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
              🍽️ Comedor Artes
            </text>
          </svg>

          {/* HTML Overlay Pins positioned over coordinates */}
          {displayedBuildings.map((building) => {
            const isSelected = selectedBuilding?.id === building.id;
            const status = getStatusColor(building.generalOccupancyPercent);

            return (
              <div
                key={building.id}
                id={`map-pin-${building.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBuilding(building);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-10 ${
                  isSelected ? 'scale-115 z-30' : 'hover:scale-110'
                }`}
                style={{
                  left: `${building.coordinates.x}%`,
                  top: `${building.coordinates.y}%`,
                }}
              >
                {/* Pin Card */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border text-xs font-extrabold whitespace-nowrap backdrop-blur-md transition-all ${
                    isSelected
                      ? 'ring-4 ring-cyan-500/30 bg-slate-900 text-white border-white scale-105'
                      : 'bg-white/95 text-slate-900 border-slate-200/90'
                  }`}
                >
                  <span className="text-sm">{status.dot}</span>
                  <span className="font-display font-extrabold">{building.shortName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                      building.generalOccupancyPercent <= 40
                        ? 'bg-emerald-100 text-emerald-800'
                        : building.generalOccupancyPercent <= 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {building.generalOccupancyPercent}%
                  </span>
                </div>

                {/* Pin pointer tip */}
                <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 shadow-xs"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Map Controls (Zoom, Center) */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/90 overflow-hidden flex flex-col">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
            className="p-2.5 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100"
            title="Acercar"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
            className="p-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Alejar"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={resetView}
          className="p-2.5 bg-white/95 backdrop-blur-md text-slate-700 rounded-2xl shadow-md border border-slate-200/90 hover:bg-slate-100 transition-colors"
          title="Centrar Campus"
        >
          <Navigation className="w-4 h-4 text-cyan-700" />
        </button>
      </div>

      {/* Legend Indicator Floating (Top Right) */}
      <div className="absolute right-3 top-20 z-10 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-[11px] font-bold shadow-xs">
        <span className="flex items-center gap-1">🟢 &lt;40% Libre</span>
        <span className="flex items-center gap-1">🟡 41-75% Moderado</span>
        <span className="flex items-center gap-1">🔴 &gt;75% Lleno</span>
      </div>

      {/* Bottom Sheet Card: As specifically requested in prompt:
          ┌─────────────────────────────┐
          │ Biblioteca Central          │
          │ 🟡 58% ocupado              │
          │                             │
          │ 1° 🔴   2° 🟢   3° 🟡       │
          │                             │
          │ [ VER DISPONIBILIDAD ]      │
          └─────────────────────────────┘
      */}
      {selectedBuilding && (
        <div className="absolute bottom-3 left-3 right-3 z-30 max-w-md mx-auto">
          <div
            id="card-map-selected-building"
            className="bg-white/98 backdrop-blur-lg rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                  {selectedBuilding.type} • Campus San Miguel
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  {selectedBuilding.name}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  selectedBuilding.generalOccupancyPercent <= 40
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : selectedBuilding.generalOccupancyPercent <= 75
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span>{getStatusColor(selectedBuilding.generalOccupancyPercent).dot}</span>
                {selectedBuilding.generalOccupancyPercent}% ocupado
              </span>
            </div>

            {/* Floors Pills: 1° 🔴   2° 🟢   3° 🟡 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Niveles y aforo en vivo:</span>
                {selectedBuilding.structureBadge && (
                  <span className="text-[10px] text-slate-400 font-semibold">{selectedBuilding.structureBadge}</span>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
                {selectedBuilding.floors.map((floor) => {
                  const pill = getFloorPill(floor);
                  const shortLevel = floor.levelLabel
                    ? floor.levelLabel.replace('SÓTANO', 'Sót.').replace('PISO', 'Piso')
                    : floor.floorNumber < 0
                    ? `Sót. ${Math.abs(floor.floorNumber)}`
                    : `${floor.floorNumber}° Piso`;

                  return (
                    <button
                      key={floor.id}
                      onClick={() => onSelectFloor(selectedBuilding, floor)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all hover:scale-105 ${pill.bg}`}
                    >
                      <span className="text-sm">{pill.icon}</span>
                      <span>{shortLevel}</span>
                      <span className="font-mono text-[11px] font-extrabold opacity-80">
                        {floor.occupancyPercent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                id="btn-map-ver-disponibilidad"
                onClick={() => onViewAvailability(selectedBuilding)}
                className="flex-1 py-2.5 px-4 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>VER DISPONIBILIDAD</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectBuilding(selectedBuilding)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                title="Cerrar detalle"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
