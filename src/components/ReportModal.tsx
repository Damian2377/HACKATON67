import React, { useState, useRef } from 'react';
import {
  X,
  MapPin,
  Send,
  CheckCircle2,
  Shield,
  User,
  Zap,
  Clock,
  Sparkles,
  Camera,
  Trash2,
  RefreshCw,
  MessageSquare,
  Award,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Building, StatusLevel, UserRole } from '../types';
import { getStatusFromOccupancy } from '../data/pucpCampus';
import { REPORT_PRESET_COMMENTS, SAMPLE_CAMPUS_PHOTOS } from '../data/gamificationData';

interface ReportModalProps {
  buildings: Building[];
  userRole: UserRole;
  onClose: () => void;
  onSubmitReport: (
    buildingId: string,
    floorId: string,
    occupancyPercent: number,
    plugsCount: number,
    note?: string,
    photoUrl?: string
  ) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  buildings,
  userRole,
  onClose,
  onSubmitReport,
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    buildings[0]?.id || 'biblio-central'
  );
  const selectedBuilding =
    buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    selectedBuilding?.floors[1]?.id || selectedBuilding?.floors[0]?.id || ''
  );
  const selectedFloor =
    selectedBuilding?.floors.find((f) => f.id === selectedFloorId) ||
    selectedBuilding?.floors[0];

  const [occupancy, setOccupancy] = useState<number>(selectedFloor?.occupancyPercent || 25);
  const [plugs, setPlugs] = useState<number>(selectedFloor?.availablePlugs || 8);
  const [comment, setComment] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showPhotoPresets, setShowPhotoPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(10);

  // Quick preset click
  const handlePresetStatus = (status: 'available' | 'moderate' | 'saturated') => {
    if (status === 'available') setOccupancy(25);
    if (status === 'moderate') setOccupancy(60);
    if (status === 'saturated') setOccupancy(90);
  };

  const handleBuildingChange = (bId: string) => {
    setSelectedBuildingId(bId);
    const b = buildings.find((x) => x.id === bId);
    if (b && b.floors.length > 0) {
      setSelectedFloorId(b.floors[0].id);
      setOccupancy(b.floors[0].occupancyPercent);
      setPlugs(b.floors[0].availablePlugs);
    }
  };

  const handleFloorChange = (fId: string) => {
    setSelectedFloorId(fId);
    const f = selectedBuilding.floors.find((x) => x.id === fId);
    if (f) {
      setOccupancy(f.occupancyPercent);
      setPlugs(f.availablePlugs);
    }
  };

  // Handle local file selection / camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotoUrl(reader.result as string);
          setShowPhotoPresets(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate live points preview
  const calculatePoints = () => {
    let pts = 10; // base report
    if (photoUrl) pts += 5; // photo bonus
    if (comment.trim().length > 0) pts += 5; // comment bonus
    return pts;
  };

  const currentPoints = calculatePoints();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = calculatePoints();
    setPointsEarned(pts);

    onSubmitReport(
      selectedBuildingId,
      selectedFloorId,
      occupancy,
      plugs,
      comment.trim() || undefined,
      photoUrl || undefined
    );

    setSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onClose();
    }, 2400);
  };

  const currentStatus = getStatusFromOccupancy(occupancy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 font-display">
                Reportar aforo y estado
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>Modo:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  {userRole === 'liderman' ? (
                    <>
                      <Shield className="w-3 h-3 text-blue-600" />
                      Vigilancia Liderman PUCP
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 text-emerald-600" />
                      Comunidad Estudiantil
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 font-display">
                  ¡Reporte enviado! 🎉
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  +{pointsEarned} Puntos ganados
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                El aforo de <strong>{selectedBuilding.shortName} ({selectedFloor.levelLabel || (selectedFloor.floorNumber < 0 ? `Sótano ${Math.abs(selectedFloor.floorNumber)}` : `Piso ${selectedFloor.floorNumber}`)})</strong> se actualizó a <strong>{occupancy}%</strong>.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-bold max-w-sm mx-auto">
                👏 ¡Has ayudado a tus compañeros a encontrar un buen lugar de estudio!
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Gamification Points Live Earn Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 rounded-2xl p-3.5 border border-amber-200/90 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      Recompensa de este reporte
                    </span>
                    <span className="text-[11px] text-slate-500">
                      +10 base {photoUrl ? '+ 5 foto ' : ''}{comment.trim() ? '+ 5 comentario' : ''}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-black text-sm text-amber-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-amber-200">
                  +{currentPoints} pts
                </span>
              </div>

              {/* 1. Ubicación (Edificio -> Piso) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  📍 1. Ubicación en el Campus
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    id="select-report-building"
                    value={selectedBuildingId}
                    onChange={(e) => handleBuildingChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.campusZone})
                      </option>
                    ))}
                  </select>

                  <select
                    id="select-report-floor"
                    value={selectedFloorId}
                    onChange={(e) => handleFloorChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    {selectedBuilding.floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.levelLabel || (f.floorNumber < 0 ? `Sótano ${Math.abs(f.floorNumber)}` : `Piso ${f.floorNumber}`)} — {f.floorName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. ¿Cómo está el aforo? (Libre, Moderado, Lleno) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  2. ¿Cómo está el aforo?
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetStatus('available')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      currentStatus === 'available'
                        ? 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block">🟢</span>
                    <span className="text-xs font-bold block mt-1">Libre</span>
                    <span className="text-[10px] text-slate-500">&lt;40%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetStatus('moderate')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      currentStatus === 'moderate'
                        ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block">🟡</span>
                    <span className="text-xs font-bold block mt-1">Moderado</span>
                    <span className="text-[10px] text-slate-500">41-75%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetStatus('saturated')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      currentStatus === 'saturated'
                        ? 'bg-rose-100/80 border-rose-400 text-rose-950 font-black shadow-xs ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block">🔴</span>
                    <span className="text-xs font-bold block mt-1">Lleno</span>
                    <span className="text-[10px] text-slate-500">&gt;75%</span>
                  </button>
                </div>
              </div>

              {/* 3. Slider de Ocupación exacta */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Ocupación aproximada de asientos:</span>
                  <span className="text-base font-black font-mono text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded-lg">
                    {occupancy}%
                  </span>
                </div>

                <input
                  id="range-occupancy-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={occupancy}
                  onChange={(e) => setOccupancy(Number(e.target.value))}
                  className="w-full accent-cyan-700 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Vacío)</span>
                  <span>50%</span>
                  <span>100% (Copado)</span>
                </div>
              </div>

              {/* 4. Enchufes disponibles */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Enchufes libres aproximados:</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={plugs}
                    onChange={(e) => setPlugs(Number(e.target.value))}
                    className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                  />
                  <span className="text-xs text-slate-500">tomas disponibles para laptops</span>
                </div>
              </div>

              {/* 5. Fotografía con cámara o archivo (PROMPT REQUIREMENT #1) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-700" />
                    <span>📷 Agregar foto de evidencia</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                      +5 pts
                    </span>
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  "Una foto ayuda a verificar el estado del espacio."
                </p>

                {/* Hidden native input for camera/file */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Photo Preview / Upload trigger */}
                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100">
                    <img
                      src={photoUrl}
                      alt="Previsualización del aforo"
                      className="w-full h-44 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-white text-xs font-bold flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-400" /> Foto adjuntada
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reemplazar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoUrl(null)}
                          className="p-1.5 bg-rose-600 text-white rounded-xl text-xs hover:bg-rose-700 shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl bg-slate-50 hover:bg-cyan-50/40 text-center cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center mx-auto">
                        <Camera className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Toca para tomar foto o seleccionar del dispositivo
                      </p>
                      <p className="text-[10px] text-slate-400">
                        JPG, PNG o foto instantánea con cámara
                      </p>
                    </div>

                    {/* Quick Sample Photos Bar for testing on desktop */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowPhotoPresets(!showPhotoPresets)}
                        className="text-[11px] font-bold text-cyan-800 hover:underline flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>{showPhotoPresets ? 'Ocultar fotos de prueba' : 'O elegir una foto de prueba del campus'}</span>
                      </button>

                      {showPhotoPresets && (
                        <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-slate-100 rounded-2xl border border-slate-200">
                          {SAMPLE_CAMPUS_PHOTOS.map((sp) => (
                            <div
                              key={sp.id}
                              onClick={() => {
                                setPhotoUrl(sp.url);
                                setShowPhotoPresets(false);
                              }}
                              className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-300 hover:border-cyan-600 transition-all"
                            >
                              <img
                                src={sp.url}
                                alt={sp.title}
                                className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="p-1 bg-white text-[10px] font-bold text-slate-800 truncate">
                                {sp.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Comentarios en los reportes (PROMPT REQUIREMENT #2) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-700" />
                    <span>💬 Agregar comentario opcional</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                      +5 pts
                    </span>
                  </label>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      comment.length > 130 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {comment.length}/140
                  </span>
                </div>

                <textarea
                  id="textarea-report-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 140))}
                  placeholder="Ej: Hay varias mesas libres pero casi todos los enchufes están ocupados..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                />

                {/* Preset Suggestions */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    Sugerencias rápidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {REPORT_PRESET_COMMENTS.slice(0, 3).map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setComment(sug)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium transition-colors text-left"
                      >
                        "{sug.slice(0, 45)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón ENVIAR REPORTE */}
              <button
                id="btn-submit-report"
                type="submit"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Send className="w-4 h-4 text-cyan-400" />
                <span>ENVIAR REPORTE (+{currentPoints} PUNTOS)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
