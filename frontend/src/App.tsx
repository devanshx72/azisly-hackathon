import { useEffect, useState, useCallback } from 'react';
import {
  fetchDashboard,
  fetchActivities,
  logActivity,
  deleteActivity,
  setTarget,
  applyRollover,
  getIdentityMode,
  getDeviceId,
  createPersistentIdentity,
  restorePersistentIdentity,
} from './api/client';
import type {
  DashboardResponse,
  Activity,
  OutlierWarningResponse,
  ActivityCreatePayload,
} from './types';
import { EMISSION_FACTORS } from './types';
import { Navbar } from './components/Navbar';
import { IdentityBanner } from './components/IdentityBanner';
import { HeroSection } from './components/HeroSection';
import { TelemetryCard } from './components/TelemetryCard';
import { TargetCard } from './components/TargetCard';
import { AuditTable } from './components/AuditTable';
import { ThresholdModal } from './components/ThresholdModal';
import { OutlierConfirmModal } from './components/OutlierConfirmModal';
import { TargetAdjustModal } from './components/TargetAdjustModal';
import { RestoreSessionModal } from './components/RestoreSessionModal';
import { Toast } from './components/Toast';

export function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; subtext?: string } | null>(null);

  // Identity state (Ephemeral vs Persistent)
  const [identityMode, setIdentityMode] = useState(getIdentityMode());
  const [deviceId, setDeviceId] = useState(getDeviceId());

  // Modals
  const [showThresholdModal, setShowThresholdModal] = useState<boolean>(false);
  const [showTargetAdjustModal, setShowTargetAdjustModal] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [outlierWarning, setOutlierWarning] = useState<OutlierWarningResponse | null>(null);
  const [pendingOutlierPayload, setPendingOutlierPayload] = useState<ActivityCreatePayload | null>(null);

  // Central data loader
  const loadData = useCallback(async () => {
    try {
      setIdentityMode(getIdentityMode());
      setDeviceId(getDeviceId());

      const [dashData, actList] = await Promise.all([
        fetchDashboard(),
        fetchActivities(),
      ]);
      setDashboard(dashData);
      setActivities(actList);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setToast({
        message: 'Network Error',
        subtext: 'Could not connect to FastAPI backend.',
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Option B: Generate and save persistent UUID
  const handleSavePersistentIdentity = async () => {
    const newUuid = createPersistentIdentity();
    setToast({
      message: 'Persistent Profile Created',
      subtext: `Identity saved under UUID: ${newUuid.substring(0, 8)}...`,
    });
    await loadData();
  };

  // Option C: Restore existing UUID profile
  const handleRestoreIdentity = async (uuidKey: string) => {
    const restoredKey = restorePersistentIdentity(uuidKey);
    setToast({
      message: 'Session Restored',
      subtext: `Loaded telemetry profile for key: ${restoredKey.substring(0, 8)}...`,
    });
    await loadData();
  };

  // Log activity handler with DP2 409 Conflict handling
  const handleLogActivity = async (
    type: string,
    quantity: number,
    note?: string,
    loggedAt?: string
  ) => {
    const payload: ActivityCreatePayload = {
      activity_type: type,
      quantity,
      logged_at: loggedAt,
    };

    try {
      const res = await logActivity(payload);
      if (res.outlierWarning) {
        // Trigger DP2 confirmation dialog
        setPendingOutlierPayload(payload);
        setOutlierWarning(res.outlierWarning);
        return;
      }

      if (res.data) {
        const factorConfig = EMISSION_FACTORS[type];
        const label = factorConfig ? factorConfig.label : type;
        const noteStr = note ? ` (${note})` : '';
        setToast({
          message: `+${res.data.co2_kg.toFixed(1)} kg CO₂ logged`,
          subtext: `${label}${noteStr} added to telemetry.`,
        });
        await loadData();
      }
    } catch (err: any) {
      setToast({
        message: 'Error Logging Activity',
        subtext: err.response?.data?.detail || 'Invalid activity input.',
      });
    }
  };

  // Confirm DP2 Outlier
  const handleConfirmOutlier = async () => {
    if (!pendingOutlierPayload) return;

    try {
      const res = await logActivity({
        ...pendingOutlierPayload,
        confirm_outlier: true,
      });

      if (res.data) {
        setToast({
          message: `Flagged Outlier Saved (+${res.data.co2_kg.toFixed(1)} kg CO²)`,
          subtext: `Saved as outlier entry (excluded from weekly budget calculation).`,
        });
        setOutlierWarning(null);
        setPendingOutlierPayload(null);
        await loadData();
      }
    } catch (err: any) {
      setToast({
        message: 'Failed to Save Outlier',
        subtext: err.response?.data?.detail || 'Error saving entry.',
      });
    }
  };

  // Delete activity handler
  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
      setToast({
        message: 'Entry Deleted',
        subtext: 'Activity removed from telemetry history.',
      });
      await loadData();
    } catch (err: any) {
      setToast({
        message: 'Deletion Failed',
        subtext: 'Could not delete entry.',
      });
    }
  };

  // Set Target handler
  const handleSetTarget = async (newTargetKg: number) => {
    try {
      await setTarget(newTargetKg);
      setToast({
        message: 'Target Updated',
        subtext: `Weekly budget set to ${newTargetKg.toFixed(1)} kg CO₂.`,
      });
      await loadData();
    } catch (err: any) {
      setToast({
        message: 'Update Failed',
        subtext: 'Could not update target budget.',
      });
    }
  };

  // Apply DP1 Rollover
  const handleApplyRollover = async () => {
    try {
      const isCurrentlyApplied = dashboard?.current_week.rollover_debt_kg ? dashboard.current_week.rollover_debt_kg > 0 : false;
      const res = await applyRollover(!isCurrentlyApplied);
      setShowThresholdModal(false);
      setToast({
        message: !isCurrentlyApplied ? 'Rollover Debt Applied' : 'Rollover Debt Reset',
        subtext: !isCurrentlyApplied
          ? `Excess carried forward to reduce next week budget to ${res.effective_target_kg.toFixed(1)} kg CO₂.`
          : 'Standard budget target restored.',
      });
      await loadData();
    } catch (err: any) {
      setToast({
        message: 'Rollover Failed',
        subtext: 'Could not apply rollover debt.',
      });
    }
  };

  const currentWeek = dashboard?.current_week || {
    week_start: new Date().toISOString(),
    week_end: new Date().toISOString(),
    day_of_week: 1,
    days_remaining: 6,
    elapsed_days: 1,
    expected_pace_percent: 14.3,
    week_co2_kg: 0,
    flagged_co2_kg: 0,
    target_kg: 30.0,
    rollover_debt_kg: 0,
    effective_target_kg: 30.0,
    progress_percent: 0,
    is_over_target: false,
    overage_kg: 0,
    pacing_status: 'on_track',
    pacing_message: 'Pacing comfortably within weekly budget.',
  };

  const totalCo2 = dashboard ? dashboard.total_co2_kg : 0;

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 lg:p-6 max-w-[1680px] mx-auto relative min-h-screen xl:min-h-0">
      {/* Top Navbar */}
      <Navbar
        onOpenThresholdModal={() => setShowThresholdModal(true)}
        onOpenRestoreModal={() => setShowRestoreModal(true)}
        onRefreshData={loadData}
        isOverTarget={currentWeek.is_over_target}
        overageKg={currentWeek.overage_kg}
      />

      {/* Identity Session Banner (Option A & B Indicator) */}
      <IdentityBanner
        identityMode={identityMode}
        deviceId={deviceId}
        onSavePersistentIdentity={handleSavePersistentIdentity}
        onOpenRestoreModal={() => setShowRestoreModal(true)}
      />

      {/* Toast Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Grid Viewport */}
      <main className="w-full flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6 items-stretch my-auto">
        {/* LEFT COLUMN: Hero text & Telemetry Card */}
        <div className="xl:col-span-6 flex flex-col justify-between space-y-4 lg:space-y-5">
          <HeroSection />

          <TelemetryCard
            weeklyTotalCo2={currentWeek.week_co2_kg || totalCo2}
            targetKg={currentWeek.target_kg || 30.0}
            overageKg={currentWeek.overage_kg}
            isOverTarget={currentWeek.is_over_target}
            categories={dashboard?.categories || []}
            onLogActivity={handleLogActivity}
            onOpenThresholdModal={() => setShowThresholdModal(true)}
          />
        </div>

        {/* RIGHT COLUMN: Target Card & Audit Table */}
        <div className="xl:col-span-6 flex flex-col justify-between space-y-4 lg:space-y-5">
          <TargetCard
            currentWeek={currentWeek}
            onOpenThresholdModal={() => setShowThresholdModal(true)}
            onOpenTargetAdjustModal={() => setShowTargetAdjustModal(true)}
          />

          <AuditTable
            activities={activities}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteActivity={handleDeleteActivity}
          />
        </div>
      </main>



      {/* Modals */}
      <ThresholdModal
        isOpen={showThresholdModal}
        currentWeek={currentWeek}
        onApplyRollover={handleApplyRollover}
        onDismiss={() => setShowThresholdModal(false)}
      />

      <OutlierConfirmModal
        warning={outlierWarning}
        onConfirm={handleConfirmOutlier}
        onCancel={() => {
          setOutlierWarning(null);
          setPendingOutlierPayload(null);
        }}
      />

      <TargetAdjustModal
        isOpen={showTargetAdjustModal}
        currentTargetKg={currentWeek.target_kg || 30.0}
        onSetTarget={handleSetTarget}
        onClose={() => setShowTargetAdjustModal(false)}
      />

      <RestoreSessionModal
        isOpen={showRestoreModal}
        onRestore={handleRestoreIdentity}
        onClose={() => setShowRestoreModal(false)}
      />
    </div>
  );
}

export default App;
