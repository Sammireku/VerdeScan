// UI-002: Header with calm status indicator (Online / Working Offline) and i18n
import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Camera,
  FolderHeart,
  BookOpen,
  Settings,
  Download,
  Globe,
} from 'lucide-react';
import { useTranslations, useLocale } from '../lib/i18n';
import type { Locale } from '@verdescan/shared';
import type { NavTab } from './BottomNav';

export interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOnline: boolean;
  queuedCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  isOnline,
  queuedCount,
}: NavbarProps) {
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const { locale, setLocale } = useLocale();

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'diagnose', label: tNav('scan'), icon: Camera },
    { id: 'garden', label: tNav('garden'), icon: FolderHeart },
    { id: 'guides', label: tNav('guides'), icon: BookOpen },
    { id: 'settings', label: tNav('settings'), icon: Settings },
  ];

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tw', label: 'Twi', flag: '🇬🇭' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
    { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF5]/95 backdrop-blur-md border-b border-[#E5E5DC] shadow-2xs">
      <div className="max-w-7xl mx-auto ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Calm Status Indicator */}
          <div className="flex items-center space-x-3 select-none">
            <div
              onClick={() => setActiveTab('diagnose')}
              className="touch-target w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
              title={tCommon('appName')}
            >
              <Leaf className="w-5 h-5 text-[#D8F3DC]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  onClick={() => setActiveTab('diagnose')}
                  className="font-extrabold text-lg tracking-tight text-[#2D6A4F] cursor-pointer"
                >
                  {tCommon('appName')}
                </span>

                {/* Calm Status Indicator: 🟢 Online or 🟡 Working Offline */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                    isOnline
                      ? 'bg-[#D8F3DC] text-[#2D6A4F] border-[#B7E4C7]'
                      : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                  }`}
                  role="status"
                  aria-label={isOnline ? tCommon('online') : tCommon('workingOffline')}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-[#2D6A4F]' : 'bg-[#E09F3E] animate-pulse'
                    }`}
                  />
                  <span>{isOnline ? tCommon('online') : tCommon('workingOffline')}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5A6B5E] font-medium leading-none mt-0.5">
                {tCommon('appTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-[#F2F2EC] p-1 rounded-2xl border border-[#E5E5DC]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`touch-target flex items-center space-x-2 ps-3.5 pe-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#2D6A4F] text-white shadow-xs'
                      : 'text-[#5A6B5E] hover:text-[#1B1B1B] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'diagnose' && queuedCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#E09F3E] text-white text-[10px] font-bold flex items-center justify-center ms-1">
                      {queuedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Language picker, Install Prompt */}
          <div className="flex items-center space-x-2">
            {/* Language Selector (44px touch target) */}
            <div className="touch-target relative flex items-center bg-[#F2F2EC] rounded-xl border border-[#E5E5DC] ps-2.5 pe-2.5">
              <Globe className="w-4 h-4 text-[#5A6B5E] me-1.5 shrink-0" />
              <select
                aria-label="Select Interface Language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="bg-transparent text-xs font-bold text-[#1B1B1B] focus:outline-none cursor-pointer pe-1"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PWA Install Button */}
            {canInstall && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="touch-target hidden sm:flex items-center space-x-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold ps-3 pe-3 rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{tCommon('installApp')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
