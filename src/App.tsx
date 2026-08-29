import React, { useState, useEffect } from 'react';
import { getStatusFromOccupancy } from './data/pucpCampus';
import { DEMO_STUDENT_USER, DEMO_LIDERMAN_USER } from './data/authData';
import { api } from './api';
import {
  Building,
  Floor,
  ActiveTab,
  UserRole,
  UserAccount,
  LidermanRound,
  LidermanReportItem,
  CommunityReport,
  Badge,
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { CampusMap } from './components/CampusMap';
import { AvailabilityTab } from './components/AvailabilityTab';
import { FloorDetailModal } from './components/FloorDetailModal';
import { AiFinderModal } from './components/AiFinderModal';
import { ReportModal } from './components/ReportModal';
import { PitchModal } from './components/PitchModal';
import { ProfileTab } from './components/ProfileTab';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginScreen } from './components/LoginScreen';
import { LidermanLayout } from './components/liderman/LidermanLayout';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { ALL_BADGES } from './data/gamificationData';

export default function App() {
  // Authentication state
  // Ahora arranca en null a propósito: así se ve la pantalla de login
  // real (Parte 3), que ahora sí pregunta al servidor.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Student navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Campus Data state
  // Arrancan vacíos: ya no usamos datos de ejemplo "quemados" en el código,
  // los pedimos al servidor apenas se abre la app (ver useEffect más abajo).
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [activeFloorDetail, setActiveFloorDetail] = useState<{ building: Building; floor: Floor } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Community Reports state
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);

  // Liderman Operational state
  const [lidermanRounds, setLidermanRounds] = useState<LidermanRound[]>([]);
  const [lidermanHistory, setLidermanHistory] = useState<LidermanReportItem[]>([]);

  // Al montar la app, pedimos los datos reales al servidor (una sola vez).
  // Esto reemplaza los datos "de ejemplo" que antes venían quemados en el código.
  useEffect(() => {
    Promise.all([
      api.getBuildings(),
      api.getReports(),
      api.getLidermanRounds(),
      api.getLidermanHistory(),
    ])
      .then(([bs, reports, rounds, history]) => {
        setBuildings(bs);
        setSelectedBuilding(bs[0] ?? null);
        setCommunityReports(reports);
        setLidermanRounds(rounds);
        setLidermanHistory(history);
      })
      .catch((err) => {
        setLoadError(
          err instanceof Error
            ? err.message
            : 'No se pudo conectar con el servidor. ¿Está corriendo "npm run server"?'
        );
      })
      .finally(() => setIsLoadingData(false));
  }, []);

  // Modals & Drawers
  const [isAiFinderOpen, setIsAiFinderOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  // Insignia recién desbloqueada, si hay una pendiente de mostrar en un modal.
  const [unlockedBadgeToShow, setUnlockedBadgeToShow] = useState<Badge | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);

  // Handlers for switching role
  const handleToggleRole = () => {
    if (currentUser?.role === 'student') {
      setCurrentUser(DEMO_LIDERMAN_USER);
    } else {
      setCurrentUser(DEMO_STUDENT_USER);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
  };

  const handleOpenMapToBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setActiveTab('map');
  };

  const handleViewAvailability = (building: Building) => {
    setSelectedBuilding(building);
    setActiveTab('availability');
  };

  const handleSelectFloor = (building: Building, floor: Floor) => {
    const currentB = buildings.find((b) => b.id === building.id) || building;
    const currentF = currentB.floors.find((f) => f.id === floor.id) || floor;
    setActiveFloorDetail({ building: currentB, floor: currentF });
  };

  // Toggle Cubicle occupation status: se lo pedimos al servidor, y cuando
  // nos responde con el edificio ya actualizado, reemplazamos ese edificio
  // en nuestro estado local (así todos los que abran la app ven el cambio).
  const handleToggleCubicle = (cubicleId: string) => {
    const buildingWithCubicle = buildings.find((b) =>
      b.floors.some((f) => f.cubicles.some((c) => c.id === cubicleId))
    );
    if (!buildingWithCubicle) return;

    api
      .toggleCubicle(buildingWithCubicle.id, cubicleId)
      .then(({ building: updatedBuilding }) => {
        setBuildings((prev) => prev.map((b) => (b.id === updatedBuilding.id ? updatedBuilding : b)));
        setActiveFloorDetail((prev) => {
          if (!prev || prev.building.id !== updatedBuilding.id) return prev;
          const updatedFloor = updatedBuilding.floors.find((f) => f.id === prev.floor.id);
          return updatedFloor ? { building: updatedBuilding, floor: updatedFloor } : prev;
        });
      })
      .catch((err) => console.error('No se pudo actualizar el cubículo:', err));
  };

  // Toggle helpful vote on a community report: igual, se lo decimos al
  // servidor y usamos su respuesta como la verdad final.
  const handleToggleReportHelpful = (reportId: string) => {
    api
      .toggleHelpful(reportId)
      .then((updatedReport) => {
        setCommunityReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)));
      })
      .catch((err) => console.error('No se pudo registrar el voto:', err));
  };

  // Después de cualquier reporte (estudiante o liderman), le avisamos
  // al servidor para que sume puntos y revise si se desbloqueó una
  // insignia nueva. Si es así, actualizamos al usuario y mostramos el modal.
  const awardPointsForReport = async () => {
    if (!currentUser) return;
    try {
      const { user: updatedUser, newlyUnlocked } = await api.awardReportPoints(currentUser.id);
      setCurrentUser(updatedUser);
      if (newlyUnlocked.length > 0) {
        const badgeInfo = ALL_BADGES.find((b) => b.id === newlyUnlocked[0]);
        if (badgeInfo) setUnlockedBadgeToShow(badgeInfo);
      }
    } catch (err) {
      console.error('No se pudieron actualizar los puntos:', err);
    }
  };

  // Submit capacity report from student collaborative modal.
  // Ahora hace DOS llamadas al servidor: 1) actualiza el piso, y
  // 2) crea el reporte en el feed. Ambas quedan guardadas de verdad.
  const handleStudentReportSubmit = async (
    buildingId: string,
    floorId: string,
    occupancyPercent: number,
    plugsCount: number,
    note?: string
  ) => {
    const targetBuilding = buildings.find((b) => b.id === buildingId);
    const targetFloor = targetBuilding?.floors.find((f) => f.id === floorId);
    if (!targetBuilding || !targetFloor) return;

    try {
      const { building: updatedBuilding } = await api.updateFloor(buildingId, floorId, {
        occupancyPercent,
        availablePlugs: plugsCount,
      });
      setBuildings((prev) => prev.map((b) => (b.id === updatedBuilding.id ? updatedBuilding : b)));

      const newReport = await api.addReport({
        userId: currentUser?.id || 'user-student-1',
        userName: currentUser?.name || 'Estudiante PUCP',
        userRole: 'student',
        userCode: currentUser?.code || '20214589',
        userFaculty: currentUser?.facultyOrUnit || 'Ingeniería Informática',
        userAvatar: currentUser?.avatarInitials || 'HV',
        buildingId: targetBuilding.id,
        buildingName: targetBuilding.name,
        floorId: targetFloor.id,
        floorNumber: targetFloor.floorNumber,
        zoneName: targetFloor.floorName,
        occupancyPercent,
        statusLevel: getStatusFromOccupancy(occupancyPercent),
        availablePlugs: plugsCount,
        availableComputers: targetFloor.availableComputers,
        availableCubicles: targetFloor.cubicles.filter((c) => !c.isOccupied).length,
        comment: note || `Reporte de aforo actualizado al ${occupancyPercent}%.`,
      });
      setCommunityReports((prev) => [newReport, ...prev]);
      await awardPointsForReport();
    } catch (err) {
      console.error('No se pudo enviar el reporte:', err);
    }
  };

  // Submit official report from Liderman panel.
  // Igual que el de estudiante: actualiza el piso en el servidor y
  // guarda un registro en el historial del Liderman (server/db.json).
  // La "ronda" (lidermanRounds) sí se queda local por ahora: es más
  // como una lista de tareas de la sesión, no algo que otros deban ver.
  const handleLidermanReportSubmit = async (
    reportData: Omit<LidermanReportItem, 'id' | 'date' | 'time' | 'supervisorChecked'>
  ) => {
    try {
      const { building: updatedBuilding } = await api.updateFloor(
        reportData.buildingId,
        reportData.floorId,
        {
          occupancyPercent: reportData.occupancyPercent,
          availablePlugs: reportData.availablePlugs,
          availableComputers: reportData.availableComputers,
        }
      );
      setBuildings((prev) => prev.map((b) => (b.id === updatedBuilding.id ? updatedBuilding : b)));

      // Marca la primera ronda pendiente como completada (esto sigue siendo local)
      setLidermanRounds((prev) => {
        const firstPendingIdx = prev.findIndex((r) => r.status === 'pending');
        if (firstPendingIdx === -1) return prev;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`;
        const updated = [...prev];
        updated[firstPendingIdx] = {
          ...updated[firstPendingIdx],
          status: 'completed',
          completedAt: timeStr,
          occupancyReported: reportData.occupancyPercent,
        };
        return updated;
      });

      const newHistoryItem = await api.addLidermanHistory({
        ...reportData,
        supervisorChecked: true,
      });
      setLidermanHistory((prev) => [newHistoryItem, ...prev]);
      await awardPointsForReport();
    } catch (err) {
      console.error('No se pudo enviar el reporte del Liderman:', err);
    }
  };

  // Find reference for Biblioteca Central for Pitch Modal
  const biblioCentral = buildings.find((b) => b.id === 'biblio-central') || buildings[0];

  // 0. MIENTRAS SE CARGAN LOS DATOS DEL SERVIDOR
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Cargando datos de AforoPUCP...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-slate-50 text-center px-6">
        <p className="text-red-600 font-medium">No se pudo conectar con el servidor</p>
        <p className="text-slate-500 text-sm">{loadError}</p>
        <p className="text-slate-400 text-xs mt-2">
          Recuerda correr <code>npm run server</code> en otra terminal.
        </p>
      </div>
    );
  }

  // 1. IF NOT LOGGED IN -> SHOW LOGIN SCREEN
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // 2. IF LIDERMAN -> SHOW EXCLUSIVE LIDERMAN LAYOUT
  if (currentUser.role === 'liderman') {
    return (
      <LidermanLayout
        user={currentUser}
        buildings={buildings}
        rounds={lidermanRounds}
        history={lidermanHistory}
        onLogout={handleLogout}
        onSwitchToStudent={() => setCurrentUser(DEMO_STUDENT_USER)}
        onLidermanSubmitReport={handleLidermanReportSubmit}
      />
    );
  }

  // 3. IF STUDENT -> SHOW FULL STUDENT EXPERIENCE
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        userRole={currentUser.role}
        onToggleRole={handleToggleRole}
        onOpenPitch={() => setIsPitchModalOpen(true)}
        onOpenNotifications={() => {
          setIsNotificationOpen(true);
          setUnreadCount(0);
        }}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* Main Content Area switched by Tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeTab
            buildings={buildings}
            communityReports={communityReports}
            onOpenAiFinder={() => setIsAiFinderOpen(true)}
            onSelectBuilding={(b) => {
              setSelectedBuilding(b);
              setActiveTab('availability');
            }}
            onSelectFloor={handleSelectFloor}
            onOpenMapToBuilding={handleOpenMapToBuilding}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenRanking={() => setActiveTab('profile')}
            onOpenPitch={() => setIsPitchModalOpen(true)}
            onToggleHelpful={handleToggleReportHelpful}
          />
        )}

        {activeTab === 'map' && (
          <CampusMap
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={handleSelectBuilding}
            onViewAvailability={handleViewAvailability}
            onSelectFloor={handleSelectFloor}
          />
        )}

        {activeTab === 'availability' && (
          <AvailabilityTab
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={handleSelectBuilding}
            onSelectFloor={handleSelectFloor}
            onOpenMapToBuilding={handleOpenMapToBuilding}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            userRole={currentUser.role}
            onToggleRole={handleToggleRole}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenRanking={() => setActiveTab('profile')}
            onSelectFloor={handleSelectFloor}
            buildings={buildings}
            onLogout={handleLogout}
            userPoints={currentUser.gamification?.points}
            userReportsCount={currentUser.gamification?.reportsCount}
            unlockedBadgeIds={currentUser.gamification?.unlockedBadges}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (4 Tabs: Inicio, Mapa, Disponibilidad, Perfil) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAiFinder={() => setIsAiFinderOpen(true)}
      />

      {/* Modal: 🤖 Encuéntrame un lugar (AI Finder) */}
      {isAiFinderOpen && (
        <AiFinderModal
          buildings={buildings}
          onClose={() => setIsAiFinderOpen(false)}
          onSelectFloor={handleSelectFloor}
          onOpenMapToBuilding={handleOpenMapToBuilding}
        />
      )}

      {/* Modal: 📍 Detalle de Piso y Cubículos */}
      {activeFloorDetail && (
        <FloorDetailModal
          building={activeFloorDetail.building}
          floor={
            buildings
              .find((b) => b.id === activeFloorDetail.building.id)
              ?.floors.find((f) => f.id === activeFloorDetail.floor.id) || activeFloorDetail.floor
          }
          reports={communityReports}
          onClose={() => setActiveFloorDetail(null)}
          onOpenMap={(b) => {
            setActiveFloorDetail(null);
            handleOpenMapToBuilding(b);
          }}
          onToggleCubicle={handleToggleCubicle}
          onToggleHelpful={handleToggleReportHelpful}
          onOpenReportModal={() => {
            setActiveFloorDetail(null);
            setIsReportModalOpen(true);
          }}
        />
      )}

      {/* Modal: 📢 Reporte de Aforo (Alumno colaborativo) */}
      {isReportModalOpen && (
        <ReportModal
          buildings={buildings}
          userRole={currentUser.role}
          onClose={() => setIsReportModalOpen(false)}
          onSubmitReport={handleStudentReportSubmit}
        />
      )}

      {/* Modal: 🏆 Pantalla de Pitch */}
      {isPitchModalOpen && (
        <PitchModal
          biblioCentral={biblioCentral}
          onClose={() => setIsPitchModalOpen(false)}
          onOpenMap={handleOpenMapToBuilding}
          onSelectFloor={handleSelectFloor}
        />
      )}

      {unlockedBadgeToShow && (
        <BadgeUnlockModal
          badge={unlockedBadgeToShow}
          onClose={() => setUnlockedBadgeToShow(null)}
          onViewAllBadges={() => setActiveTab('profile')}
        />
      )}

      {/* Drawer: 🔔 Notificaciones en vivo */}
      {isNotificationOpen && (
        <NotificationDrawer
          buildings={buildings}
          onClose={() => setIsNotificationOpen(false)}
          onSelectFloor={handleSelectFloor}
        />
      )}
    </div>
  );
}

