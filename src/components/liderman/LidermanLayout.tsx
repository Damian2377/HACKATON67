import React, { useState } from 'react';
import {
  UserAccount,
  Building,
  LidermanRound,
  LidermanReportItem,
  LidermanTab,
} from '../../types';
import { LidermanHeader } from './LidermanHeader';
import { LidermanBottomNav } from './LidermanBottomNav';
import { LidermanDashboard } from './LidermanDashboard';
import { LidermanReportForm } from './LidermanReportForm';
import { LidermanHistory } from './LidermanHistory';
import { LidermanProfile } from './LidermanProfile';

interface LidermanLayoutProps {
  user: UserAccount;
  buildings: Building[];
  rounds: LidermanRound[];
  history: LidermanReportItem[];
  onLogout: () => void;
  onSwitchToStudent: () => void;
  onOpenRanking?: () => void;
  onLidermanSubmitReport: (
    report: Omit<LidermanReportItem, 'id' | 'date' | 'time' | 'supervisorChecked'>
  ) => void;
}

export const LidermanLayout: React.FC<LidermanLayoutProps> = ({
  user,
  buildings,
  rounds,
  history,
  onLogout,
  onSwitchToStudent,
  onOpenRanking,
  onLidermanSubmitReport,
}) => {
  const [activeTab, setActiveTab] = useState<LidermanTab>('dashboard');
  const [targetBuildingId, setTargetBuildingId] = useState<string | undefined>();
  const [targetFloorNumber, setTargetFloorNumber] = useState<number | undefined>();

  const pendingRounds = rounds.filter((r) => r.status === 'pending');

  const handleStartReportFromDashboard = (buildingId?: string, floorNumber?: number) => {
    setTargetBuildingId(buildingId);
    setTargetFloorNumber(floorNumber);
    setActiveTab('report');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Liderman Specialized Header */}
      <LidermanHeader user={user} onLogout={onLogout} />

      {/* Main Body per Tab */}
      <main className="flex-1 bg-slate-100 text-slate-900">
        {activeTab === 'dashboard' && (
          <LidermanDashboard
            user={user}
            rounds={rounds}
            buildings={buildings}
            onStartReport={handleStartReportFromDashboard}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'report' && (
          <LidermanReportForm
            buildings={buildings}
            initialBuildingId={targetBuildingId}
            initialFloorNumber={targetFloorNumber}
            onSubmitReport={(reportData) => {
              onLidermanSubmitReport(reportData);
            }}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'history' && (
          <LidermanHistory
            history={history}
            onNewReportClick={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'profile' && (
          <LidermanProfile
            user={user}
            historyCount={history.length}
            onLogout={onLogout}
            onSwitchToStudentView={onSwitchToStudent}
            onOpenRanking={onOpenRanking}
          />
        )}
      </main>

      {/* Liderman 4-Tab Bottom Nav */}
      <LidermanBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingRoundsCount={pendingRounds.length}
      />
    </div>
  );
};
