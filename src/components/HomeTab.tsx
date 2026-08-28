import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Monitor,
  VolumeX,
  Users,
  ChevronRight,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  PlusCircle,
  Camera,
  Trophy,
  Shield,
} from 'lucide-react';
import { Building, Floor, StatusLevel, CommunityReport } from '../types';
import { RecentReportsFeed } from './RecentReportsFeed';

interface HomeTabProps {
  buildings: Building[];
  communityReports?: CommunityReport[];
  onOpenAiFinder: () => void;
  onSelectBuilding: (building: Building) => void;
  onSelectFloor: (building: Building, floor: Floor) => void;
  onOpenMapToBuilding: (building: Building) => void;
  onOpenReportModal: () => void;
  onOpenRanking?: () => void;
  onOpenPitch: () => void;
  onToggleHelpful?: (reportId: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  buildings,
  communityReports = [],
  onOpenAiFinder,
  onSelectBuilding,
  onSelectFloor,
  onOpenMapToBuilding,
  onOpenReportModal,
  onOpenRanking = () => {},
  onOpenPitch,
  onToggleHelpful = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Quick helper for occupancy badges
  const getStatusBadge = (percent: number) => {
    if (percent <= 40) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        label: `${percent}% ocupado`,
        indicator: '🟢',
      };
    }
    if (percent <= 75) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: `${percent}% ocupado`,
        indicator: '🟡',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      label: `${percent}% ocupado`,
      indicator: '🔴',
    };
  };

  // Find the 3 highlighted spaces specified in prompt
  const biblioCentral = buildings.find((b) => b.id === 'biblio-central') || buildings[0];
  const eegg = buildings.find((b) => b.id === 'eegg-ciencias') || buildings[1];
  const cia = buildings.find((b) => b.id === 'cia-innovacion') || buildings[2];

  // Specific highlighted floors for the 3 main cards
  const bcFloor2 = biblioCentral?.floors.find((f) => f.floorNumber === 2) || biblioCentral?.floors[0];
  const eeggFloor1 = eegg?.floors.find((f) => f.floorNumber === 1) || eegg?.floors[0];
  const ciaFloor1 = cia?.floors.find((f) => f.floorNumber === 1) || cia?.floors[0];

  // Filtered buildings if search is active
  const filteredBuildings = buildings.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.popularFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.floors.some((f) => f.floorName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!selectedTag) return matchesSearch;
    if (selectedTag === 'plugs') return matchesSearch && b.floors.some((f) => f.availablePlugs >= 4);
    if (selectedTag === 'quiet') return matchesSearch && b.floors.some((f) => f.noiseLevel === 'Bajo');
    if (selectedTag === 'pcs') return matchesSearch && b.floors.some((f) => f.availableComputers > 0);
    if (selectedTag === 'cubicles') return matchesSearch && b.floors.some((f) => f.cubicles.some((c) => !c.isOccupied));
    return matchesSearch;
  });

  return (
    <div className="pb-28 pt-2 px-4 max-w-2xl mx-auto space-y-6">
      {/* 1. Header Greeting Section */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Hola 👋
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium mt-0.5">
            ¿Dónde quieres estudiar hoy?
          </p>
        </div>

        <button
          onClick={onOpenRanking}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">Ranking</span>
          <span>🏆 Top PUCP</span>
        </button>
      </div>

      {/* 2. Buscador */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-home"
            type="text"
            placeholder="Buscar biblioteca, sala o edificio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedTag === null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedTag(selectedTag === 'plugs' ? null : 'plugs')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedTag === 'plugs'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Con enchufes</span>
          </button>
          <button
            onClick={() => setSelectedTag(selectedTag === 'quiet' ? null : 'quiet')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedTag === 'quiet'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Silencioso</span>
          </button>
          <button
            onClick={() => setSelectedTag(selectedTag === 'cubicles' ? null : 'cubicles')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedTag === 'cubicles'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cubículos libres</span>
          </button>
        </div>
      </div>

      {/* 3. Hero Feature Button: "🤖 ENCUÉNTRAME UN LUGAR" */}
      <div
        id="btn-ai-recommender"
        onClick={onOpenAiFinder}
        className="group relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700 cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                IA AforoPUCP
              </span>
            </div>
            <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
              <span>Probar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white group-hover:text-cyan-200 transition-colors">
              ENCUÉNTRAME UN LUGAR
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1 leading-relaxed">
              Dime qué necesitas y te recomendaré dónde estudiar en segundos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-xl text-slate-200">
              🔌 Enchufes para laptop
            </span>
            <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-xl text-slate-200">
              🤫 100% Silencioso
            </span>
            <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-xl text-slate-200">
              👥 Grupal con pizarra
            </span>
          </div>
        </div>
      </div>

      {/* 4. Section: ESPACIOS DESTACADOS (Live Overview) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              ⭐ Espacios Destacados
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Disponibilidad en vivo en campus</p>
          </div>
          <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
            🟢 {buildings.length} ubicaciones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: BIBLIOTECA CENTRAL */}
          {bcFloor2 && (
            <div
              id="card-bc-piso2"
              onClick={() => onSelectFloor(biblioCentral, bcFloor2)}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-cyan-700 transition-colors">
                      BIBLIOTECA CENTRAL
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Piso 2</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    25% ocupado
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[25%]"></div>
                </div>

                {/* Resources 🔌 8, 📚 3 */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900">8</span>
                      <span className="text-[11px] text-slate-500 ml-1">enchufes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900">3</span>
                      <span className="text-[11px] text-slate-500 ml-1">cubículos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> hace {bcFloor2.lastUpdatedMinutesAgo} min
                </span>
                <span className="text-cyan-800 font-bold group-hover:translate-x-0.5 transition-transform">
                  Ver piso &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card 2: EEGG CIENCIAS */}
          {eeggFloor1 && (
            <div
              id="card-eegg-piso1"
              onClick={() => onSelectFloor(eegg, eeggFloor1)}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-cyan-700 transition-colors">
                      EEGG CIENCIAS
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Piso 1</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    60% ocupado
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[60%]"></div>
                </div>

                {/* Resources 🔌 4, 💻 2 */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900">4</span>
                      <span className="text-[11px] text-slate-500 ml-1">enchufes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Monitor className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900">2</span>
                      <span className="text-[11px] text-slate-500 ml-1">PCs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> hace {eeggFloor1.lastUpdatedMinutesAgo} min
                </span>
                <span className="text-cyan-800 font-bold group-hover:translate-x-0.5 transition-transform">
                  Ver piso &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card 3: SALA H / CIA */}
          {ciaFloor1 && (
            <div
              id="card-cia-sala-h"
              onClick={() => onSelectFloor(cia, ciaFloor1)}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-cyan-700 transition-colors">
                      SALA H (CIA)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Piso 1</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    91% ocupado
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[91%]"></div>
                </div>

                {/* Resources 🔌 1, 💻 0 */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900">1</span>
                      <span className="text-[11px] text-slate-500 ml-1">enchufe</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-500">0</span>
                      <span className="text-[11px] text-slate-400 ml-1">PCs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> hace {ciaFloor1.lastUpdatedMinutesAgo} min
                </span>
                <span className="text-rose-700 font-bold group-hover:translate-x-0.5 transition-transform">
                  Saturado ⚠️
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Community & Liderman Reports Feed (PROMPT REQUIREMENT #3 & #4) */}
      <div className="pt-2">
        <RecentReportsFeed
          reports={communityReports}
          onToggleHelpful={onToggleHelpful}
          onOpenReportModal={onOpenReportModal}
          onSelectFloor={(bId, fNum) => {
            const b = buildings.find((x) => x.id === bId);
            if (b) {
              const f = b.floors.find((fl) => fl.floorNumber === fNum) || b.floors[0];
              onSelectFloor(b, f);
            }
          }}
        />
      </div>

      {/* 6. Pitch Highlight Showcase Banner */}
      <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-700 text-white text-[10px] font-bold uppercase tracking-wider">
                El problema resuelto
              </span>
              <span className="text-xs font-bold text-slate-700">¿Dónde habrá sitio?</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Antes: <span className="text-slate-500 font-normal">subir piso por piso perdiendo 20 minutos</span> 😵💫 <br className="sm:hidden" />
              Ahora: <strong className="text-slate-900">Biblioteca Central Piso 2: 25%, 8 enchufes y 3 cubículos</strong> 😎
            </p>
          </div>
          <button
            onClick={onOpenPitch}
            className="shrink-0 px-3.5 py-2 bg-white hover:bg-slate-50 text-cyan-900 border border-cyan-300 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-cyan-700" />
            <span className="hidden sm:inline">Ver Pitch</span>
          </button>
        </div>
      </div>

      {/* 7. Search Results list (if searching) */}
      {searchQuery && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900">
            Resultados de búsqueda ({filteredBuildings.length})
          </h3>
          <div className="space-y-2">
            {filteredBuildings.map((b) => {
              const status = getStatusBadge(b.generalOccupancyPercent);
              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBuilding(b)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-cyan-300 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {b.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                      <p className="text-xs text-slate-500">{b.floors.length} pisos • {b.popularFor.slice(0, 45)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${status.bg}`}>
                      {status.indicator} {b.generalOccupancyPercent}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
