// UI-002: OfflineBanner (calm amber strip: "Working with saved content")
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslations } from '../lib/i18n';

export interface OfflineBannerProps {
  isOnline: boolean;
  queuedCount: number;
}

export function OfflineBanner({ isOnline, queuedCount }: OfflineBannerProps) {
  const t = useTranslations('banners');

  if (isOnline && queuedCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#FEF3C7] text-[#92400E] border-b border-[#FDE68A] text-xs py-2.5 ps-4 pe-4 transition-all shadow-2xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 font-bold">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 shrink-0 text-[#E09F3E]" />
          ) : (
            <RefreshCw className="w-4 h-4 shrink-0 text-[#2D6A4F] animate-spin" />
          )}
          <span>
            {!isOnline ? t('offline') : `${queuedCount} ${t('offlineSub')}`}
          </span>
        </div>

        {queuedCount > 0 && (
          <span className="bg-[#E09F3E] text-white px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold shadow-2xs">
            {queuedCount}
          </span>
        )}
      </div>
    </div>
  );
}
