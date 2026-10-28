// UI Rework: App Shell matching uploaded VerdeScan mobile mockups exactly
import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav, type NavTab } from './components/BottomNav';
import { HomeView } from './features/home/HomeView';
import { DiagnosisView } from './features/diagnose/DiagnosisView';
import { AiBotanistView } from './features/ai_botanist/AiBotanistView';
import { PlantsView } from './features/garden/PlantsView';
import { HistoryView } from './features/history/HistoryView';
import { SettingsView } from './features/settings/SettingsView';
import { PlantCareHub } from './features/resources/PlantCareHub';
import { FindSeedsView } from './features/seeds/FindSeedsView';
import { GrowersCommunityHub } from './features/community/GrowersCommunityHub';
import { CropRecoveryTracker } from './features/recovery/CropRecoveryTracker';
import { OutbreakRadarView } from './features/radar/OutbreakRadarView';
import { FieldReportModal } from './features/reports/FieldReportModal';
import { SprayDosageCalculator } from './features/calculator/SprayDosageCalculator';
import { HarvestTrackerModal } from './features/garden/HarvestTrackerModal';
import { ScanModal } from './features/diagnose/ScanModal';
import { PremiumModal } from './components/PremiumModal';
import { AuthModal } from './components/AuthModal';
import { UpdateBanner } from './components/UpdateBanner';
import { queueRunner } from './lib/queue';
import { type QueuedDiagnosis } from './lib/db';
import { I18nProvider, useLocale } from './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queuedItems, setQueuedItems] = useState<QueuedDiagnosis[]>([]);

  // Modals & Sub-views
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'identify' | 'diagnose'>('diagnose');
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPlantCareOpen, setIsPlantCareOpen] = useState(false);
  const [isFindSeedsOpen, setIsFindSeedsOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // Industry-Grade Agronomy Feature States
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isHarvestOpen, setIsHarvestOpen] = useState(false);

  const { locale, setLocale } = useLocale();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to Dexie offline queue
    const unsubscribe = queueRunner.subscribe((items: QueuedDiagnosis[]) => {
      setQueuedItems(items);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleOpenScan = (mode: 'identify' | 'diagnose' = 'diagnose') => {
    setScanMode(mode);
    setIsScanOpen(true);
  };

  const closeAllSubviews = () => {
    setIsHistoryOpen(false);
    setIsSettingsOpen(false);
    setIsPlantCareOpen(false);
    setIsFindSeedsOpen(false);
    setIsCommunityOpen(false);
    setIsRecoveryOpen(false);
    setIsRadarOpen(false);
    setIsCalculatorOpen(false);
  };

  return (
    <PhoneFrame isOnline={isOnline} queuedCount={queuedItems.length}>
      {/* UpdateBanner (suppressed during active capture) */}
      <UpdateBanner isCapturing={isScanOpen} />

      {/* Main Feature View */}
      <main className="flex-1 pb-24">
        {/* Settings Sub-View */}
        {isSettingsOpen ? (
          <div className="p-4">
            <SettingsView
              locale={locale}
              setLocale={setLocale}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>
        ) : isHistoryOpen ? (
          /* History Sub-View */
          <HistoryView
            onBack={() => setIsHistoryOpen(false)}
            onStartNewChat={() => {
              setIsHistoryOpen(false);
              setActiveTab('ai_expert');
            }}
          />
        ) : isPlantCareOpen ? (
          /* Plant Care Resource Hub */
          <PlantCareHub
            onClose={() => setIsPlantCareOpen(false)}
            onOpenScan={() => handleOpenScan('diagnose')}
          />
        ) : isFindSeedsOpen ? (
          /* Interactive Find Seeds Map */
          <FindSeedsView onClose={() => setIsFindSeedsOpen(false)} />
        ) : isCommunityOpen ? (
          /* Interactive Growers Community Hub */
          <GrowersCommunityHub
            onClose={() => setIsCommunityOpen(false)}
            onOpenScan={() => handleOpenScan('diagnose')}
          />
        ) : isRecoveryOpen ? (
          /* Crop Recovery & Longitudinal Health Tracker */
          <CropRecoveryTracker
            onClose={() => setIsRecoveryOpen(false)}
            onOpenScan={() => handleOpenScan('diagnose')}
          />
        ) : isRadarOpen ? (
          /* Regional Outbreak Radar & Early Warning */
          <OutbreakRadarView
            onClose={() => setIsRadarOpen(false)}
            onOpenBotanist={() => {
              setIsRadarOpen(false);
              setActiveTab('ai_expert');
            }}
          />
        ) : isCalculatorOpen ? (
          /* Organic Spray & Dosage Calculator */
          <SprayDosageCalculator onClose={() => setIsCalculatorOpen(false)} />
        ) : (
          /* Primary Tabs */
          <>
            {activeTab === 'home' && (
              <HomeView
                onOpenScan={handleOpenScan}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenPremium={() => setIsPremiumOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onOpenFindSeeds={() => setIsFindSeedsOpen(true)}
                onOpenPlantCare={() => setIsPlantCareOpen(true)}
                onOpenCommunity={() => setIsCommunityOpen(true)}
                onOpenRecovery={() => setIsRecoveryOpen(true)}
                onOpenRadar={() => setIsRadarOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
                onOpenCalculator={() => setIsCalculatorOpen(true)}
                onOpenHarvest={() => setIsHarvestOpen(true)}
                onOpenBotanist={() => {
                  closeAllSubviews();
                  setActiveTab('ai_expert');
                }}
              />
            )}

            {activeTab === 'diagnose' && (
              <DiagnosisView
                onOpenScan={() => handleOpenScan('diagnose')}
                onOpenHistory={() => setIsHistoryOpen(true)}
              />
            )}

            {activeTab === 'ai_expert' && (
              <AiBotanistView
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenScan={() => handleOpenScan('diagnose')}
              />
            )}

            {activeTab === 'plants' && (
              <PlantsView onOpenScan={() => handleOpenScan('diagnose')} />
            )}
          </>
        )}
      </main>

      {/* 5-Item Bottom Navigation Bar with Center Elevated Scan Button */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          closeAllSubviews();
          setActiveTab(tab);
        }}
        onOpenScan={() => handleOpenScan('diagnose')}
        queuedCount={queuedItems.length}
      />

      {/* GlobalG.A.P. Field Scouting Report Modal */}
      <FieldReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Harvest & Days-to-Maturity Countdown Modal */}
      <HarvestTrackerModal
        isOpen={isHarvestOpen}
        onClose={() => setIsHarvestOpen(false)}
      />

      {/* Full-Screen Scan / Camera Wizard Modal (with First Attached Image UI) */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        locale={locale}
        isOnline={isOnline}
        initialMode={scanMode}
      />

      {/* Premium Plus Modal */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
      />

      {/* Robust Sign In & Sign Up Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </PhoneFrame>
  );
}

export default function App() {
  return (
    <I18nProvider initialLocale="en">
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </I18nProvider>
  );
}
