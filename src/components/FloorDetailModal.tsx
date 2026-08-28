import React, { useState } from 'react';
import {
  X,
  Zap,
  Monitor,
  BookOpen,
  VolumeX,
  Volume2,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Users,
  Sparkles,
  Share2,
  Camera,
  PlusCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Building, Floor, Cubicle, CommunityReport } from '../types';
import { ReportCard } from './ReportCard';

interface FloorDetailModalProps {
  building: Building;
  floor: Floor;
  reports?: CommunityReport[];
  onClose: () => void;
  onOpenMap: (building: Building) => void;
  onToggleCubicle: (cubicleId: string) => void;
  onToggleHelpful?: (reportId: string) => void;
  onOpenReportModal?: () => void;
}

export const FloorDetailModal: React.FC<FloorDetailModalProps> = ({
  building,
  floor,
  reports = [],
  onClose,
  onOpenMap,
  onToggleCubicle,
  onToggleHelpful,
  onOpenReportModal,
}) => {
  const [selectedCubicle, setSelectedCubicle] = useState<Cubicle | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);

  const getStatusBadge = (percent: number) => {
    if (percent <= 40) {
      return {
        label: 'Disponible',
        dot: '🟢',
        colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barColor: 'bg-emerald-500',
      };
    }
    if (percent <= 75) {
      return {
        label: 'Moderado',
        dot: '🟡',
        colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Saturado',
      dot: '🔴',
      colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
      barColor: 'bg-rose-500',
    };
  };

  const status = getStatusBadge(floor.occupancyPercent);

  // Filter reports for this building and floor safely
  const safeReports = Array.isArray(reports) ? reports : [];
  const floorReports = safeReports.filter(
    (r) => r && r.buildingId === building.id && r.floorNumber === floor.floorNumber
  );

  const handleClaimCubicle = (cubicle: Cubicle) => {
    onToggleCubicle(cubicle.id);
    if (!cubicle.isOccupied) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
      setReserveSuccess(`¡Cubículo ${cubicle.name} reservado para tu sesión!`);
    } else {
      setReserveSuccess(`Cubículo ${cubicle.name} marcado como disponible.`);
    }
    setTimeout(() => setReserveSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-cyan-800 uppercase tracking-wider">
                {building.shortName}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Campus San Miguel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
              {floor.levelLabel || (floor.floorNumber < 0 ? `Sótano ${Math.abs(floor.floorNumber)}` : `Piso ${floor.floorNumber}`)}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{floor.floorName}</p>
          </div>

          <button
            id="btn-close-floor-detail"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status & Live Update Badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${status.colorClass}`}
              >
                <span>{status.dot}</span>
                <span>{floor.occupancyPercent}% ocupado</span>
              </span>

              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Actualizado hace <strong>{floor.lastUpdatedMinutesAgo} min</strong>
              </span>
            </div>

            {/* Ocupación General Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  👥 Ocupación de asientos
                </span>
                <span className="font-mono text-slate-900">
                  {floor.occupiedSeats} / {floor.totalSeats} asientos
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
                  style={{ width: `${floor.occupancyPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Resources Grid: Enchufes + Computadoras */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Enchufes */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Enchufes
                  </span>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {floor.availablePlugs} libres
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${floor.totalPlugs > 0 ? (floor.availablePlugs / floor.totalPlugs) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Computadoras */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-indigo-500" />
                    Computadoras
                  </span>
                  <span className="text-xs font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {floor.availableComputers} libres
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${
                        floor.totalComputers > 0
                          ? (floor.availableComputers / floor.totalComputers) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Ruido y Tipo de Estudio */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <VolumeX className="w-4 h-4 text-cyan-700" />
                <span>
                  Nivel de ruido: <strong>{floor.noiseLevel}</strong> ({floor.studyType})
                </span>
              </div>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-md">
                Zona de concentración
              </span>
            </div>
          </div>

          {/* Section: Cubículos Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  📚 Cubículos — {floor.levelLabel || (floor.floorNumber < 0 ? `Sótano ${Math.abs(floor.floorNumber)}` : `Piso ${floor.floorNumber}`)}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  {floor.cubicles.filter((c) => !c.isOccupied).length} disponibles
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Toca para interactuar</span>
            </div>

            {floor.cubicles.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                Este piso está configurado como sala de lectura general abierta sin cubículos cerrados.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {floor.cubicles.map((c) => {
                  const isAvailable = !c.isOccupied;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleClaimCubicle(c)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-md ${
                        isAvailable
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
                          : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-black text-slate-900">{c.name}</span>
                        <span className="text-sm">{isAvailable ? '🟢' : '🔴'}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">
                        {c.capacity} personas
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200/60">
                        <span
                          className={`text-[10px] font-bold block ${
                            isAvailable ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isAvailable ? 'LIBRE • Usar' : `Ocupado ${c.occupiedUntil || ''}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Reportes Comunitarios y Fotos de este Piso (PROMPT REQUIREMENT) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  📢 Reportes y Evidencia Reciente de este Piso
                </h3>
              </div>
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="text-xs font-bold text-cyan-800 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Reportar aquí</span>
                </button>
              )}
            </div>

            {floorReports.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs text-slate-600">
                  Aún no hay reportes específicos con foto para este piso hoy.
                </p>
                {onOpenReportModal && (
                  <button
                    onClick={onOpenReportModal}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800"
                  >
                    Sé el primero en reportar (+20 pts)
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {floorReports.map((r) => (
                  <ReportCard
                    key={r.id}
                    report={r}
                    onToggleHelpful={onToggleHelpful || (() => {})}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => onOpenMap(building)}
            className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>VER EN MAPA</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
