import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Send,
  CheckCircle2,
  Zap,
  Monitor,
  BookOpen,
  MapPin,
  Clock,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Building, Floor, StatusLevel, LidermanReportItem } from '../../types';
import { getStatusFromOccupancy } from '../../data/pucpCampus';

interface LidermanReportFormProps {
  buildings: Building[];
  initialBuildingId?: string;
  initialFloorNumber?: number;
  onSubmitReport: (report: Omit<LidermanReportItem, 'id' | 'date' | 'time' | 'supervisorChecked'>) => void;
  onBackToDashboard: () => void;
}

export const LidermanReportForm: React.FC<LidermanReportFormProps> = ({
  buildings,
  initialBuildingId,
  initialFloorNumber,
  onSubmitReport,
  onBackToDashboard,
}) => {
  const defaultBuilding =
    buildings.find((b) => b.id === initialBuildingId) || buildings[0];

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(defaultBuilding.id);
  const selectedBuilding =
    buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

  const defaultFloor =
    selectedBuilding.floors.find((f) => f.floorNumber === initialFloorNumber) ||
    selectedBuilding.floors[0];

  const [selectedFloorId, setSelectedFloorId] = useState<string>(defaultFloor.id);
  const selectedFloor =
    selectedBuilding.floors.find((f) => f.id === selectedFloorId) ||
    selectedBuilding.floors[0];

  // Specific zone or room inside floor
  const [selectedZone, setSelectedZone] = useState<string>(
    selectedFloor?.floorName || 'Sala General de Estudio'
  );

  // Occupancy & resources
  const [occupancy, setOccupancy] = useState<number>(selectedFloor?.occupancyPercent || 30);
  const [plugs, setPlugs] = useState<number>(selectedFloor?.availablePlugs || 8);
  const [computers, setComputers] = useState<number>(selectedFloor?.availableComputers || 4);
  const [cubicles, setCubicles] = useState<number>(
    selectedFloor?.cubicles?.filter((c) => !c.isOccupied).length || 3
  );
  const [notes, setNotes] = useState<string>('Ronda regular completada sin anomalías.');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Confirmation state
  const [confirmedData, setConfirmedData] = useState<{
    time: string;
    location: string;
    status: StatusLevel;
    occupancy: number;
    plugs: number;
    computers: number;
    cubicles: number;
  } | null>(null);

  const handleBuildingChange = (bId: string) => {
    setSelectedBuildingId(bId);
    const b = buildings.find((x) => x.id === bId);
    if (b && b.floors.length > 0) {
      const f = b.floors[0];
      setSelectedFloorId(f.id);
      setSelectedZone(f.floorName);
      setOccupancy(f.occupancyPercent);
      setPlugs(f.availablePlugs);
      setComputers(f.availableComputers);
      setCubicles(f.cubicles?.filter((c) => !c.isOccupied).length || 0);
    }
  };

  const handleFloorChange = (fId: string) => {
    setSelectedFloorId(fId);
    const f = selectedBuilding.floors.find((x) => x.id === fId);
    if (f) {
      setSelectedZone(f.floorName);
      setOccupancy(f.occupancyPercent);
      setPlugs(f.availablePlugs);
      setComputers(f.availableComputers);
      setCubicles(f.cubicles?.filter((c) => !c.isOccupied).length || 0);
    }
  };

  const handleQuickStatusPreset = (status: StatusLevel) => {
    if (status === 'available') setOccupancy(25);
    if (status === 'moderate') setOccupancy(60);
    if (status === 'saturated') setOccupancy(90);
  };

  const currentStatus = getStatusFromOccupancy(occupancy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const reportPayload = {
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      floorId: selectedFloor.id,
      floorNumber: selectedFloor.floorNumber,
      zoneName: selectedZone,
      occupancyPercent: occupancy,
      statusLevel: currentStatus,
      availablePlugs: plugs,
      availableComputers: computers,
      availableCubicles: cubicles,
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined,
    };

    onSubmitReport(reportPayload);

    setConfirmedData({
      time: timeStr,
      location: `${selectedBuilding.name} — Piso ${selectedFloor.floorNumber} (${selectedZone})`,
      status: currentStatus,
      occupancy: occupancy,
      plugs: plugs,
      computers: computers,
      cubicles: cubicles,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleResetForNext = () => {
    setConfirmedData(null);
  };

  return (
    <div className="pb-28 pt-3 px-4 max-w-2xl mx-auto space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al panel</span>
        </button>

        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[11px] font-bold border border-blue-400/30 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          Ronda Oficial Liderman
        </span>
      </div>

      {/* Confirmation View (when submitted) */}
      {confirmedData ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white font-display">
                Reporte registrado correctamente
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Los datos han sido sincronizados en tiempo real para todos los estudiantes en el campus.
              </p>
            </div>
          </div>

          {/* Report summary ticket */}
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Hora del reporte:
              </span>
              <span className="font-extrabold text-white font-mono text-sm">
                {confirmedData.time} hrs
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-slate-700 pb-2.5 gap-2">
              <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Ubicación reportada:
              </span>
              <span className="font-bold text-white text-right">
                {confirmedData.location}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
              <span className="text-slate-400">Estado reportado:</span>
              <span
                className={`px-2.5 py-1 rounded-lg font-black text-xs uppercase flex items-center gap-1.5 ${
                  confirmedData.status === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : confirmedData.status === 'moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                <span>
                  {confirmedData.status === 'available'
                    ? '🟢 LIBRE'
                    : confirmedData.status === 'moderate'
                    ? '🟡 MODERADO'
                    : '🔴 LLENO'}
                </span>
                <span className="font-mono">({confirmedData.occupancy}%)</span>
              </span>
            </div>

            {/* Resources reported */}
            <div className="pt-1">
              <span className="text-slate-400 block mb-2 font-bold text-[11px] uppercase tracking-wider">
                Recursos registrados:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                  <span className="text-amber-400 font-mono font-black text-sm block">
                    {confirmedData.plugs}
                  </span>
                  <span className="text-[10px] text-slate-400">Enchufes</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                  <span className="text-indigo-400 font-mono font-black text-sm block">
                    {confirmedData.computers}
                  </span>
                  <span className="text-[10px] text-slate-400">Computadoras</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-mono font-black text-sm block">
                    {confirmedData.cubicles}
                  </span>
                  <span className="text-[10px] text-slate-400">Cubículos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleResetForNext}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hacer otro reporte</span>
            </button>

            <button
              onClick={onBackToDashboard}
              className="py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Volver al panel</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md space-y-6"
        >
          {/* Section Title */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Radio className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                  Reportar aforo
                </h1>
                <p className="text-xs text-slate-500">
                  Completa los datos observados en el piso correspondiente
                </p>
              </div>
            </div>
          </div>

          {/* 1. SELECCIÓN DE UBICACIÓN (Edificio, Piso, Zona o Sala) */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              📍 1. Ubicación de la Ronda
            </label>

            <div className="space-y-2.5">
              {/* Edificio */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1">
                  Edificio:
                </span>
                <select
                  id="select-liderman-building"
                  value={selectedBuildingId}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.campusZone}) — {b.floors.length} pisos
                    </option>
                  ))}
                </select>
              </div>

              {/* Piso */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Piso:
                  </span>
                  <select
                    id="select-liderman-floor"
                    value={selectedFloorId}
                    onChange={(e) => handleFloorChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {selectedBuilding.floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        Piso {f.floorNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona o sala */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    Zona / Sala:
                  </span>
                  <input
                    id="input-liderman-zone"
                    type="text"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    placeholder="ej. Sala General o Cubículos"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. NIVEL DE OCUPACIÓN (🟢 LIBRE, 🟡 MODERADO, 🔴 LLENO) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                📊 2. Nivel de Ocupación
              </label>
              <span className="text-xs font-bold text-slate-600">
                Valor actual: <strong className="font-mono text-blue-900">{occupancy}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-status-libre"
                onClick={() => handleQuickStatusPreset('available')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  currentStatus === 'available'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl block">🟢</span>
                <span className="text-xs font-bold block mt-1">LIBRE</span>
                <span className="text-[10px] text-slate-500">&lt; 40% aforo</span>
              </button>

              <button
                type="button"
                id="btn-status-moderado"
                onClick={() => handleQuickStatusPreset('moderate')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  currentStatus === 'moderate'
                    ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl block">🟡</span>
                <span className="text-xs font-bold block mt-1">MODERADO</span>
                <span className="text-[10px] text-slate-500">40 - 75% aforo</span>
              </button>

              <button
                type="button"
                id="btn-status-lleno"
                onClick={() => handleQuickStatusPreset('saturated')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  currentStatus === 'saturated'
                    ? 'bg-rose-100 border-rose-400 text-rose-950 font-black shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl block">🔴</span>
                <span className="text-xs font-bold block mt-1">LLENO</span>
                <span className="text-[10px] text-slate-500">&gt; 75% aforo</span>
              </button>
            </div>

            {/* Slider de ajuste fino */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Ajuste porcentual de aforo:</span>
                <span className="text-sm font-black font-mono text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                  {occupancy}%
                </span>
              </div>
              <input
                id="range-liderman-occupancy"
                type="range"
                min="0"
                max="100"
                step="5"
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Vacío)</span>
                <span>50%</span>
                <span>100% (Saturado)</span>
              </div>
            </div>
          </div>

          {/* 3. RECURSOS DISPONIBLES (Enchufes, Dispositivos/Computadoras, Cubículos) */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              ⚡ 3. Recursos Disponibles
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Enchufes */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Enchufes libres</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPlugs(Math.max(0, plugs - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-base font-black font-mono text-slate-900">
                    {plugs}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPlugs(plugs + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Computadoras */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  <span>PCs libres</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setComputers(Math.max(0, computers - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-base font-black font-mono text-slate-900">
                    {computers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setComputers(computers + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cubículos */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>Cubículos libres</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCubicles(Math.max(0, cubicles - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-base font-black font-mono text-slate-900">
                    {cubicles}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCubicles(cubicles + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fotografía de evidencia oficial */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>📷 Fotografía de evidencia oficial (Opcional):</span>
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                >
                  Eliminar foto
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              "Una foto ayuda a verificar el estado del espacio."
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (reader.result) setPhotoUrl(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />

            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100">
                <img
                  src={photoUrl}
                  alt="Previsualización Liderman"
                  className="w-full h-40 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-400" /> Foto verificada
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white/90 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Cambiar
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50 hover:bg-blue-50/40 text-center cursor-pointer transition-all space-y-1"
              >
                <p className="text-xs font-bold text-slate-700">
                  📷 Toca para adjuntar foto de la ronda con cámara o archivo
                </p>
                <p className="text-[10px] text-slate-400">
                  Ayuda a los alumnos y supervisores a ver el estado del piso
                </p>
              </div>
            )}
          </div>

          {/* Notas de ronda */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-notes"
              className="text-xs font-bold text-slate-700 block"
            >
              Observación de la ronda (Opcional):
            </label>
            <input
              id="input-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ej. Todo en orden, tomas de corriente operativas"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* BOTÓN GRANDE: ENVIAR REPORTE */}
          <button
            id="btn-liderman-submit-report"
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 hover:from-blue-600 hover:to-slate-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>ENVIAR REPORTE OFICIAL</span>
          </button>
        </form>
      )}
    </div>
  );
};
