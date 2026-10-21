// UI-002: Mobile Bottom Navigation (Scan, Garden, Guides, Settings)
import React from 'react';
import { Camera, FolderHeart, BookOpen, Settings } from 'lucide-react';
import { useTranslations } from '../lib/i18n';

export type NavTab = 'diagnose' | 'garden' | 'guides' | 'settings';

export interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  queuedCount: number;
}

export function BottomNav({ activeTab, setActiveTab, queuedCount }: BottomNavProps) {
  const t = useTranslations('nav');

  const tabs = [
    { id: 'diagnose' as const, label: t('scan'), icon: Camera },
    { id: 'garden' as const, label: t('garden'), icon: FolderHeart },
    { id: 'guides' as const, label: t('guides'), icon: BookOpen },
    { id: 'settings' as const, label: t('settings'), icon: Settings },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAFAF5]/98 backdrop-blur-lg border-t border-[#E5E5DC] pb-safe shadow-lg"
    >
      <div className="flex items-center justify-around ps-2 pe-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`touch-target flex flex-col items-center justify-center rounded-2xl transition-all relative flex-1 py-1.5 ${
                isActive
                  ? 'text-[#2D6A4F] font-extrabold bg-[#D8F3DC]/70 shadow-2xs'
                  : 'text-[#5A6B5E] hover:text-[#1B1B1B] font-semibold'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="text-[11px] leading-tight truncate">{tab.label}</span>

              {tab.id === 'diagnose' && queuedCount > 0 && (
                <span
                  className="absolute top-1 end-3 w-4 h-4 rounded-full bg-[#E09F3E] text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                  aria-label={`${queuedCount} queued scans`}
                >
                  {queuedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
