import React, { useState } from 'react';
import { INITIAL_BUILDINGS, getStatusFromOccupancy } from './data/pucpCampus';
import {
  DEMO_STUDENT_USER,
  DEMO_LIDERMAN_USER,
  INITIAL_LIDERMAN_ROUNDS,
  INITIAL_LIDERMAN_HISTORY,
} from './data/authData';
import { INITIAL_COMMUNITY_REPORTS } from './data/reportsData';
import {
  Building,
  Floor,
  ActiveTab,
  UserRole,
  UserAccount,
  LidermanRound,
  LidermanReportItem,
  CommunityReport,
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

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(DEMO_STUDENT_USER);

  // Student navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Campus Data state
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(INITIAL_BUILDINGS[0]);
  const [activeFloorDetail, setActiveFloorDetail] = useState<{ building: Building; floor: Floor } | null>(null);

  // Community Reports state
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);

  // Liderman Operational state
  const [lidermanRounds, setLidermanRounds] = useState<LidermanRound[]>(INITIAL_LIDERMAN_ROUNDS);
  const [lidermanHistory, setLidermanHistory] = useState<LidermanReportItem[]>(INITIAL_LIDERMAN_HISTORY);

  // Modals & Drawers
  const [isAiFinderOpen, setIsAiFinderOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
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

  // Toggle Cubicle occupation status in real time
  const handleToggleCubicle = (cubicleId: string) => {
    setBuildings((prev) =>
      prev.map((b) => {
        let buildingModified = false;
        const newFloors = b.floors.map((f) => {
          const cubicleIndex = f.cubicles.findIndex((c) => c.id === cubicleId);
          if (cubicleIndex === -1) return f;

          buildingModified = true;
          const updatedCubicles = f.cubicles.map((c) => {
            if (c.id === cubicleId) {
              const nextState = !c.isOccupied;
              return {
                ...c,
                isOccupied: nextState,
                status: nextState ? 'saturated' : 'available',
                occupiedUntil: nextState ? '18:00' : undefined,
              };
            }
            return c;
          });

          return {
            ...f,
            cubicles: updatedCubicles,
            lastUpdatedMinutesAgo: 0,
          };
        });

        if (!buildingModified) return b;
        return {
          ...b,
          floors: newFloors,
          lastUpdatedMinutesAgo: 0,
        };
      })
    );

    if (activeFloorDetail) {
      setActiveFloorDetail((prev) => {
        if (!prev) return null;
        const updatedB = buildings.find((b) => b.id === prev.building.id);
        const updatedF = updatedB?.floors.find((f) => f.id === prev.floor.id);
        return updatedB && updatedF ? { building: updatedB, floor: updatedF } : prev;
      });
    }
  };

  // Toggle helpful vote on a community report
  const handleToggleReportHelpful = (reportId: string) => {
    setCommunityReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const isVoted = r.helpfulVotedByMe;
          return {
            ...r,
            helpfulVotedByMe: !isVoted,
            helpfulCount: isVoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
          };
        }
        return r;
      })
    );
  };

  // Submit capacity report from student collaborative modal
  const handleStudentReportSubmit = (
    buildingId: string,
    floorId: string,
    occupancyPercent: number,
    plugsCount: number,
    note?: string
  ) => {
    const targetBuilding = buildings.find((b) => b.id === buildingId);
    const targetFloor = targetBuilding?.floors.find((f) => f.id === floorId);

    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== buildingId) return b;

        const updatedFloors = b.floors.map((f) => {
          if (f.id !== floorId) return f;
          return {
            ...f,
            occupancyPercent,
            availablePlugs: plugsCount,
            lastUpdatedMinutesAgo: 0,
            occupiedSeats: Math.round((occupancyPercent / 100) * f.totalSeats),
          };
        });

        const avg = Math.round(
          updatedFloors.reduce((acc, curr) => acc + curr.occupancyPercent, 0) / updatedFloors.length
        );

        return {
          ...b,
          floors: updatedFloors,
          generalOccupancyPercent: avg,
          status: getStatusFromOccupancy(avg),
          lastUpdatedMinutesAgo: 0,
        };
      })
    );

    // Also add to community reports feed
    if (targetBuilding && targetFloor) {
      const newReport: CommunityReport = {
        id: `crep-${Date.now()}`,
        userId: currentUser?.id || 'user-student-1',
        userName: currentUser?.name || 'Estudiante PUCP',
        userRole: 'student',
        userCode: currentUser?.code || '20214589',
        userFaculty: currentUser?.faculty || 'Ingeniería Informática',
        userAvatar: currentUser?.avatar || 'HV',
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
        timestamp: 'Hace un momento',
        createdAt: Date.now(),
        verified: false,
        helpfulCount: 0,
        helpfulVotedByMe: false,
      };
      setCommunityReports((prev) => [newReport, ...prev]);
    }
  };

  // Submit official report from Liderman panel
  const handleLidermanReportSubmit = (
    reportData: Omit<LidermanReportItem, 'id' | 'date' | 'time' | 'supervisorChecked'>
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    // 1. Update Campus building/floor state
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== reportData.buildingId) return b;

        const updatedFloors = b.floors.map((f) => {
          if (f.id !== reportData.floorId) return f;
          return {
            ...f,
            occupancyPercent: reportData.occupancyPercent,
            availablePlugs: reportData.availablePlugs,
            availableComputers: reportData.availableComputers,
            lastUpdatedMinutesAgo: 0,
            occupiedSeats: Math.round((reportData.occupancyPercent / 100) * f.totalSeats),
          };
        });

        const avg = Math.round(
          updatedFloors.reduce((acc, curr) => acc + curr.occupancyPercent, 0) / updatedFloors.length
        );

        return {
          ...b,
          floors: updatedFloors,
          generalOccupancyPercent: avg,
          status: getStatusFromOccupancy(avg),
          lastUpdatedMinutesAgo: 0,
        };
      })
    );

    // 2. Update matching Liderman round to completed
    setLidermanRounds((prev) => {
      let matched = false;
      const updated = prev.map((r) => {
        if (
          !matched &&
          r.status === 'pending' &&
          (r.buildingId === reportData.buildingId || !r.completedAt)
        ) {
          matched = true;
          return {
            ...r,
            status: 'completed' as const,
            completedAt: timeStr,
            occupancyReported: reportData.occupancyPercent,
          };
        }
        return r;
      });

      // If no pending matched, mark the first pending round
      if (!matched) {
        const firstPendingIdx = updated.findIndex((r) => r.status === 'pending');
        if (firstPendingIdx !== -1) {
          updated[firstPendingIdx] = {
            ...updated[firstPendingIdx],
            status: 'completed' as const,
            completedAt: timeStr,
            occupancyReported: reportData.occupancyPercent,
          };
        }
      }

      return updated;
    });

    // 3. Add record to Liderman history
    const newHistoryItem: LidermanReportItem = {
      id: `rep-${Date.now()}`,
      date: 'Hoy, 28 Ago',
      time: timeStr,
      buildingId: reportData.buildingId,
      buildingName: reportData.buildingName,
      floorId: reportData.floorId,
      floorNumber: reportData.floorNumber,
      zoneName: reportData.zoneName,
      occupancyPercent: reportData.occupancyPercent,
      statusLevel: reportData.statusLevel,
      availablePlugs: reportData.availablePlugs,
      availableComputers: reportData.availableComputers,
      availableCubicles: reportData.availableCubicles,
      notes: reportData.notes,
      supervisorChecked: true,
    };

    setLidermanHistory((prev) => [newHistoryItem, ...prev]);
  };

  // Find reference for Biblioteca Central for Pitch Modal
  const biblioCentral = buildings.find((b) => b.id === 'biblio-central') || buildings[0];

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

