import React, { useState } from 'react';
import {
  History,
  Clock,
  Calendar,
  Building2,
  Zap,
  Monitor,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { LidermanReportItem } from '../../types';

interface LidermanHistoryProps {
  history?: LidermanReportItem[];
  onNewReportClick: () => void;
}

export const LidermanHistory: React.FC<LidermanHistoryProps> = ({
  history = [],
  onNewReportClick,
}) => {
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const safeHistory = Array.isArray(history) ? history : [];

  const filteredHistory = safeHistory.filter((item) => {
    if (!item) return false;
    const matchesBuilding =
      filterBuilding === 'all' || item.buildingId === filterBuilding;
    const matchesSearch =
      (item.buildingName && item.buildingName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.zoneName && item.zoneName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesBuilding && matchesSearch;
  });

  return (
    <div className="pb-28 pt-3 px-4 max-w-2xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Historial de Reportes
              </h1>
              <p className="text-xs text-slate-500">
                Registro cronológico de tus rondas de supervisión
              </p>
            </div>
          </div>

          <button
            onClick={onNewReportClick}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo reporte</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por zona o nota..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Todos los edificios ({history.length})</option>
            <option value="biblio-central">Biblioteca Central</option>
            <option value="cia-innovacion">CIA Innovación</option>
            <option value="tinkuy-estudiantil">Tinkuy Estudiantil</option>
            <option value="eegg-ciencias">EEGG Ciencias</option>
            <option value="pabellon-z">Pabellón Z</option>
          </select>
        </div>
      </div>

      {/* History Records List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          <span>Reportes Registrados ({filteredHistory.length})</span>
          <span className="text-emerald-700 flex items-center gap-1 text-[11px] lowercase font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> sincronizado en vivo
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">No se encontraron reportes con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isLibre = item.statusLevel === 'available';
            const isModerado = item.statusLevel === 'moderate';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 transition-all hover:border-blue-300"
              >
                {/* Top Row: Date, Time & Occupancy Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-600">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      {item.time} hrs
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 ${
                      isLibre
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isModerado
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <span>{isLibre ? '🟢 LIBRE' : isModerado ? '🟡 MODERADO' : '🔴 LLENO'}</span>
                    <span className="font-mono">{item.occupancyPercent}%</span>
                  </span>
                </div>

                {/* Location Info */}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
                    {item.buildingName} — Piso {item.floorNumber}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Zona: {item.zoneName}
                  </p>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      <strong className="font-mono">{item.availablePlugs}</strong> enchufes
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700 border-x border-slate-200/80 px-2">
                    <Monitor className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      <strong className="font-mono">{item.availableComputers}</strong> PCs
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-700 pl-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong className="font-mono">{item.availableCubicles}</strong> cubículos
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    "{item.notes}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
