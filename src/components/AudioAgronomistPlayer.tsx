// T-026: Persistent Floating Audio-First Agronomist Mini-Player
import React from 'react';
import { Volume2, VolumeX, Pause, Play, Square, SkipForward } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

interface AudioAgronomistPlayerProps {
  isPlaying: boolean;
  activeTitle?: string;
  onPlayPause: () => void;
  onStop: () => void;
  isSunlightMode?: boolean;
}

export function AudioAgronomistPlayer({
  isPlaying,
  activeTitle = 'Agronomist Field Advisory',
  onPlayPause,
  onStop,
  isSunlightMode = false,
}: AudioAgronomistPlayerProps) {
  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 z-40 max-w-md mx-auto pointer-events-auto">
      <div
        className={`bg-[#1A3B29] text-white rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 border ${
          isSunlightMode ? 'border-2 border-white ring-2 ring-black' : 'border-[#78C441]/40'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#78C441] text-[#122B1E] flex items-center justify-center shrink-0 animate-pulse">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-bold text-[#78C441] block">
              Audio Agronomist Live
            </span>
            <p className="text-xs font-extrabold text-white truncate">{activeTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onPlayPause();
            }}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
            title="Play / Pause"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onStop();
            }}
            className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all"
            title="Stop Audio"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
