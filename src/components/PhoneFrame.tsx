// Clean App Container layout without phone bezels, artificial notches, or mockup frames
import React from 'react';

export interface PhoneFrameProps {
  children: React.ReactNode;
  isOnline: boolean;
  queuedCount: number;
}

export function PhoneFrame({ children, isOnline, queuedCount }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#19201D] flex flex-col antialiased selection:bg-[#D8F3DC] selection:text-[#1A3B29]">
      {/* Offline notification strip if offline */}
      {!isOnline && (
        <div className="bg-[#E09F3E] text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-1.5 sticky top-0 z-50 shadow-sm">
          <span>🟡 Working Offline (Saved Content & Local Cache Active)</span>
          {queuedCount > 0 && <span>• {queuedCount} queued</span>}
        </div>
      )}

      {/* Main Content Area centered with clean max-width */}
      <div className="flex-1 w-full max-w-xl mx-auto flex flex-col">
        {children}
      </div>
    </div>
  );
}
