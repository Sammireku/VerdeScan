// UI-002: VerdeScan Application Shell with Global Banners, BottomNav & next-intl Provider
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { UpdateBanner } from './components/UpdateBanner';
import { BottomNav, type NavTab } from './components/BottomNav';
import { CameraWizard } from './features/diagnose/CameraWizard';
import { ResultView } from './features/diagnose/ResultView';
import { GardenView } from './features/garden/GardenView';
import { GuidesView } from './features/guides/GuidesView';
import { SettingsView } from './features/settings/SettingsView';
import { queueRunner } from './lib/queue';
import { type QueuedDiagnosis } from './lib/db';
import { I18nProvider, useTranslations, useLocale } from './lib/i18n';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import type { SubmitDiagnosisRes } from '@verdescan/shared';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState<NavTab>('diagnose');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queuedItems, setQueuedItems] = useState<QueuedDiagnosis[]>([]);
  const [currentResult, setCurrentResult] = useState<SubmitDiagnosisRes | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const tQueue = useTranslations('queue');
  const tBanners = useTranslations('banners');
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

  const handleDiagnosisComplete = (result: SubmitDiagnosisRes, thumbnail?: string) => {
    setCurrentResult(result);
    setCurrentThumbnail(thumbnail || null);
    setIsCapturing(false);
  };

  const handleResetDiagnosis = () => {
    setCurrentResult(null);
    setCurrentThumbnail(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1B1B1B] flex flex-col font-sans antialiased selection:bg-[#D8F3DC] selection:text-[#2D6A4F]">
      {/* Non-blocking UpdateBanner (strictly suppressed during camera capture) */}
      <UpdateBanner isCapturing={isCapturing} />

      {/* Top Navigation with Calm Status Indicator */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'diagnose') {
            setCurrentResult(null);
            setIsCapturing(false);
          }
        }}
        isOnline={isOnline}
        queuedCount={queuedItems.length}
      />

      {/* Offline Status Alert Banner */}
      <OfflineBanner isOnline={isOnline} queuedCount={queuedItems.length} />

      {/* Main Feature Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8 py-6 pb-28 md:pb-12">
        {activeTab === 'diagnose' && (
          <div className="space-y-6">
            {/* If there are pending items in Dexie queue, show pending queue cards */}
            {queuedItems.length > 0 && !currentResult && (
              <div className="bg-[#FEF3C7]/90 rounded-2xl border border-[#FDE68A] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#92400E] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#E09F3E] animate-spin" /> {tQueue('pendingTitle')} ({queuedItems.length})
                  </span>
                  <span className="text-[11px] text-[#92400E] font-medium">{tQueue('autoSync')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {queuedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl border border-[#FDE68A] shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1B1B1B]">
                          Crop: <strong className="text-[#2D6A4F] capitalize">{item.context.cropId || 'Tomato'}</strong>
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                          {item.state}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5A6B5E] line-clamp-1 font-medium">
                        {item.context.symptomsText || 'Foliar lesions photo captured'}
                      </p>

                      {/* Offline Checklist of Likely Causes for Chosen Crop (Page 27, Item 6) */}
                      <div className="bg-[#FAFAF5] p-2.5 rounded-xl border border-[#E5E5DC] text-[11px] text-[#1B1B1B] space-y-1">
                        <span className="font-bold text-[#2D6A4F]">{tQueue('offlineChecklist')}:</span>
                        <ul className="list-disc ps-4 space-y-0.5 text-[10px] text-[#5A6B5E]">
                          <li>Check for concentric ring spots on lower leaves (Early Blight)</li>
                          <li>Inspect leaf undersides for small aphid or whitefly clusters</li>
                          <li>Verify if yellowing is V-shaped along central midrib (Nitrogen)</li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[#5A6B5E] font-mono">
                          {tQueue('attempts')}: {item.attempts}/5
                        </span>
                        <div className="flex items-center gap-2">
                          {isOnline && (
                            <button
                              type="button"
                              onClick={() => queueRunner.retryItem(item.id)}
                              className="touch-target text-xs text-[#2D6A4F] font-bold hover:underline flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> {tQueue('syncNow')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => queueRunner.removeItem(item.id)}
                            className="touch-target text-stone-400 hover:text-[#BC4749] p-1.5"
                            title="Delete queued item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentResult ? (
              <ResultView
                result={currentResult}
                locale={locale}
                thumbnailUrl={currentThumbnail}
                onReset={handleResetDiagnosis}
              />
            ) : (
              <CameraWizard
                locale={locale}
                isOnline={isOnline}
                onDiagnosisComplete={handleDiagnosisComplete}
              />
            )}
          </div>
        )}

        {activeTab === 'garden' && <GardenView />}

        {activeTab === 'guides' && <GuidesView locale={locale} />}

        {activeTab === 'settings' && (
          <SettingsView locale={locale} setLocale={setLocale} />
        )}
      </main>

      {/* Mobile Bottom Navigation (Scan, Garden, Guides, Settings) with 44px Touch Targets */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'diagnose') {
            setCurrentResult(null);
            setIsCapturing(false);
          }
        }}
        queuedCount={queuedItems.length}
      />

      {/* Footer Regulatory & System Status Strip */}
      <footer className="hidden md:block border-t border-[#E5E5DC] bg-white py-3.5 text-xs text-[#5A6B5E]">
        <div className="max-w-7xl mx-auto ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
            <span>{tBanners('disclaimer')}</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-medium text-[#78716c]">
            <span>Dexie Queue Active</span>
            <span>44px Touch Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider initialLocale="en">
      <MainAppShell />
    </I18nProvider>
  );
}
