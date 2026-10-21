// UI-002: UpdateBanner (non-blocking, never force-reloads during capture)
import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTranslations } from '../lib/i18n';

export interface UpdateBannerProps {
  isCapturing?: boolean; // When true, the banner strictly suppresses reloads to preserve field capture
}

export function UpdateBanner({ isCapturing = false }: UpdateBannerProps) {
  const t = useTranslations('banners');
  const [hasUpdate, setHasUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setHasUpdate(true);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setHasUpdate(true);
          }
        });
      });
    });
  }, []);

  const handleUpdate = () => {
    // Non-negotiable: NEVER force-reload if the user is in the middle of field camera capture
    if (isCapturing) {
      return;
    }

    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!hasUpdate || dismissed || isCapturing) {
    return null;
  }

  return (
    <div
      role="alert"
      className="bg-[#D8F3DC] border-b border-[#B7E4C7] text-[#2D6A4F] text-xs py-2 ps-4 pe-4 shadow-2xs transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 font-bold">
          <Sparkles className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{t('updateAvailable')}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            className="touch-target bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            {t('updateAction')}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t('dismiss')}
            className="touch-target text-[#5A6B5E] hover:text-[#1B1B1B] p-1.5 rounded-xl hover:bg-white/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
