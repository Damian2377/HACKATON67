import React, { useState } from 'react';
import {
  Shield,
  User,
  Camera,
  Filter,
  Search,
  Sparkles,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { CommunityReport } from '../types';
import { ReportCard } from './ReportCard';

interface RecentReportsFeedProps {
  reports?: CommunityReport[] | null;
  onToggleHelpful?: (reportId: string) => void;
  onOpenReportModal?: () => void;
  onSelectFloor?: (buildingId: string, floorNumber: number) => void;
  filterBuildingId?: string;
  filterFloorNumber?: number;
  title?: string;
  subtitle?: string;
  showNewReportButton?: boolean;
  isLoading?: boolean;
}

export const RecentReportsFeed: React.FC<RecentReportsFeedProps> = ({
  reports = [],
  onToggleHelpful = () => {},
  onOpenReportModal,
  onSelectFloor,
  filterBuildingId,
  filterFloorNumber,
  title = '📢 Reportes Recientes de la Comunidad',
  subtitle = 'Evidencia en tiempo real reportada por Liderman y estudiantes PUCP',
  showNewReportButton = true,
  isLoading = false,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'photos' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure reports is always a valid array
  const safeReports = Array.isArray(reports) ? reports : [];

  // Filter based on props and local filters
  const filteredReports = safeReports.filter((rep) => {
    if (!rep) return false;
    if (filterBuildingId && rep.buildingId !== filterBuildingId) return false;
    if (filterFloorNumber !== undefined && rep.floorNumber !== filterFloorNumber) return false;

    if (filterType === 'verified' && !rep.verified) return false;
    if (filterType === 'photos' && !rep.photoUrl) return false;
    if (filterType === 'available' && rep.statusLevel !== 'available') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (rep.buildingName && rep.buildingName.toLowerCase().includes(q)) ||
        (rep.zoneName && rep.zoneName.toLowerCase().includes(q)) ||
        (rep.userName && rep.userName.toLowerCase().includes(q)) ||
        (rep.comment && rep.comment.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & New Report Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
              {title}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-900">
              {filteredReports.length} {filteredReports.length === 1 ? 'activo' : 'activos'}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {showNewReportButton && onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="self-start sm:self-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Agregar reporte (+20 pts)</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todos ({safeReports.length})
        </button>

        <button
          onClick={() => setFilterType('verified')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filterType === 'verified'
              ? 'bg-blue-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Verificados Liderman</span>
        </button>

        <button
          onClick={() => setFilterType('photos')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filterType === 'photos'
              ? 'bg-cyan-700 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-cyan-600" />
          <span>Con Foto</span>
        </button>

        <button
          onClick={() => setFilterType('available')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filterType === 'available'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🟢 Libres</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="w-6 h-6 border-2 border-cyan-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Cargando reportes recientes...</p>
        </div>
      ) : safeReports.length === 0 ? (
        /* Empty state: No reports at all */
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-slate-700">No hay reportes recientes.</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Sé el primero en reportar el aforo o adjuntar una foto de este espacio para ganar puntos.
          </p>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="mt-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Hacer reporte ahora (+20 pts)</span>
            </button>
          )}
        </div>
      ) : filteredReports.length === 0 ? (
        /* Empty filter state */
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-slate-700">No hay reportes con este filtro</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Sé el primero en reportar el aforo o adjuntar una foto de este espacio para ganar puntos.
          </p>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="mt-2 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold inline-block"
            >
              Hacer reporte ahora
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onToggleHelpful={onToggleHelpful}
              onSelectFloor={onSelectFloor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
