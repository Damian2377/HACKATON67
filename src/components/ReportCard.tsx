import React, { useState } from 'react';
import {
  Shield,
  User,
  Zap,
  Monitor,
  BookOpen,
  ThumbsUp,
  Clock,
  MapPin,
  Camera,
  Maximize2,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CommunityReport, Building, Floor } from '../types';

interface ReportCardProps {
  report: CommunityReport;
  onToggleHelpful: (reportId: string) => void;
  onSelectFloor?: (buildingId: string, floorNumber: number) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onToggleHelpful,
  onSelectFloor,
}) => {
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const isLiderman = report.userRole === 'liderman';

  const getStatusBadge = (percent: number) => {
    if (percent <= 40) {
      return {
        label: 'Libre',
        dot: '🟢',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        bar: 'bg-emerald-500',
      };
    }
    if (percent <= 75) {
      return {
        label: 'Moderado',
        dot: '🟡',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        bar: 'bg-amber-500',
      };
    }
    return {
      label: 'Lleno',
      dot: '🔴',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      bar: 'bg-rose-500',
    };
  };

  const status = getStatusBadge(report.occupancyPercent);

  return (
    <>
      <div
        id={`report-card-${report.id}`}
        className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all space-y-3.5"
      >
        {/* Header: User & Role Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                isLiderman
                  ? 'bg-blue-900 text-white border border-blue-700'
                  : 'bg-gradient-to-br from-cyan-600 to-sky-700 text-white'
              }`}
            >
              {report.userAvatar || (isLiderman ? 'LID' : 'PUCP')}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {report.userName}
                </span>
                {isLiderman ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs">
                    <Shield className="w-3 h-3 text-blue-700 fill-blue-700" />
                    REPORTE VERIFICADO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <User className="w-3 h-3 text-emerald-600" />
                    Estudiante
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                <span>{report.userFaculty || (isLiderman ? 'Seguridad PUCP' : 'Estudiante')}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {report.timestamp}
                </span>
              </div>
            </div>
          </div>

          {/* Occupancy Badge */}
          <div
            className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 shrink-0 ${status.bg}`}
          >
            <span>{status.dot}</span>
            <span>{report.occupancyPercent}%</span>
          </div>
        </div>

        {/* Location banner */}
        <div
          onClick={() => onSelectFloor && onSelectFloor(report.buildingId, report.floorNumber)}
          className={`px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between transition-colors ${
            onSelectFloor ? 'cursor-pointer hover:bg-slate-100 hover:border-slate-300' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <div className="truncate text-xs font-bold text-slate-800">
              <span>{report.buildingName}</span>
              <span className="text-slate-400 mx-1">•</span>
              <span className="text-cyan-900 font-extrabold">Piso {report.floorNumber}</span>
              {report.zoneName && (
                <span className="text-slate-500 font-normal ml-1 hidden sm:inline truncate">
                  ({report.zoneName})
                </span>
              )}
            </div>
          </div>

          {onSelectFloor && (
            <span className="text-[11px] font-bold text-cyan-800 hover:underline shrink-0 ml-2">
              Ver piso &rarr;
            </span>
          )}
        </div>

        {/* Resources Metrics (Plugs, Computers, Cubicles) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {report.availablePlugs}{' '}
              <span className="font-normal text-[11px] text-slate-500">enchufes</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Monitor className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              {report.availableComputers ?? 0}{' '}
              <span className="font-normal text-[11px] text-slate-500">PCs</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {report.availableCubicles ?? 0}{' '}
              <span className="font-normal text-[11px] text-slate-500">cubículos</span>
            </span>
          </div>
        </div>

        {/* Comment text */}
        {report.comment && (
          <div className="text-xs text-slate-700 font-normal leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
            <p className="italic">"{report.comment}"</p>
          </div>
        )}

        {/* Photo thumbnail if attached */}
        {report.photoUrl && (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48">
            <img
              src={report.photoUrl}
              alt={`Foto de ${report.buildingName} piso ${report.floorNumber}`}
              className="w-full h-36 sm:h-44 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
              onClick={() => setShowImageLightbox(true)}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>Evidencia fotográfica</span>
            </div>

            <button
              onClick={() => setShowImageLightbox(true)}
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-lg shadow-sm text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Ampliar</span>
            </button>
          </div>
        )}

        {/* Footer: Helpful Button & Timestamp */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            id={`btn-helpful-${report.id}`}
            onClick={() => onToggleHelpful(report.id)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
              report.helpfulVotedByMe
                ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${
                report.helpfulVotedByMe ? 'fill-cyan-700 text-cyan-700' : 'text-slate-500'
              }`}
            />
            <span>Útil</span>
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                report.helpfulVotedByMe ? 'bg-cyan-200 text-cyan-900' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {report.helpfulCount}
            </span>
          </button>

          <span className="text-[11px] text-slate-400 font-medium">
            {report.helpfulCount > 0
              ? `${report.helpfulCount} alumnos lo marcaron como útil`
              : 'Sé el primero en validar'}
          </span>
        </div>
      </div>

      {/* Full Photo Lightbox Modal */}
      {showImageLightbox && report.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowImageLightbox(false)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-slate-800 relative space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-700" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Evidencia fotográfica • {report.buildingName} (Piso {report.floorNumber})
                </h4>
              </div>
              <button
                onClick={() => setShowImageLightbox(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={report.photoUrl}
                alt="Evidencia del aforo"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Reportado por {report.userName}</p>
                <p className="text-slate-500">{report.comment || 'Sin comentario adicional'}</p>
              </div>
              <button
                onClick={() => setShowImageLightbox(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
