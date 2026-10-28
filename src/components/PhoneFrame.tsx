// Clean App Container layout without phone bezels, artificial notches, or mockup frames
import React, { useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';
import { queueRunner } from '../lib/queue';
import { triggerHaptic } from '../lib/haptics';

export interface PhoneFrameProps {
  children: React.ReactNode;
  isOnline: boolean;
  queuedCount: number;
  isSunlightMode?: boolean;
}

export function PhoneFrame({
  children,
  isOnline,
  queuedCount,
  isSunlightMode = false,
}: PhoneFrameProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleManualSync = async () => {
    triggerHaptic('tap');
    setIsSyncing(true);
    try {
      await queueRunner.processQueue();
      triggerHaptic('success');
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className={`min-h-screen text-[#19201D] flex flex-col antialiased selection:bg-[#D8F3DC] selection:text-[#1A3B29] transition-colors ${
        isSunlightMode ? 'bg-[#FFFFFF] font-medium' : 'bg-[#F6F8F5]'
      }`}
    >
      {/* Offline Notification & Interactive Sync Drawer */}
      {(!isOnline || queuedCount > 0) && (
        <div
          className={`sticky top-0 z-50 px-4 py-2 text-xs font-bold shadow-xs flex items-center justify-between gap-2 border-b ${
            !isOnline
              ? 'bg-[#E09F3E] text-white border-amber-600'
              : 'bg-[#1A3B29] text-white border-[#78C441]/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-white shrink-0 animate-pulse" />
                <span>Working Offline (Local IndexedDB Active)</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 text-[#78C441] shrink-0" />
                <span>
                  {queuedCount} {queuedCount === 1 ? 'diagnosis' : 'diagnoses'} pending cloud sync
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {queuedCount > 0 && isOnline && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="bg-[#78C441] hover:bg-[#6BB536] text-[#122B1E] px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : syncDone ? 'Synced!' : 'Sync Now'}</span>
              </button>
            )}

            {syncDone && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-[#78C441]" />
                Done
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area centered with clean max-width */}
      <div className="flex-1 w-full max-w-xl mx-auto flex flex-col">
        {children}
      </div>
    </div>
  );
}
