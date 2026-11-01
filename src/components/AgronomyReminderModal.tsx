// T-081: Daily Morning Agronomy Reminder Modal
// Allows growers to configure daily morning local notification alarms based on crops and location
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  MapPin,
  Sprout,
  Sparkles,
} from 'lucide-react';
import {
  getAgronomyReminderConfig,
  saveAgronomyReminderConfig,
  requestReminderNotificationPermission,
  triggerTestReminderNotification,
  type AgronomyReminderConfig,
  isNotificationSupported,
} from '../lib/notification-scheduler';
import { getGardenPlants } from '../lib/garden';
import { triggerHaptic } from '../lib/haptics';

export interface AgronomyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSunlightMode?: boolean;
}

const PRESET_TIMES = [
  { value: '06:00', label: '6:00 AM (Dawn Scouting)' },
  { value: '06:30', label: '6:30 AM (Early Irrigation)' },
  { value: '07:00', label: '7:00 AM (Standard Morning)' },
  { value: '07:30', label: '7:30 AM (Field Departure)' },
  { value: '08:00', label: '8:00 AM (Morning Chores)' },
];

export function AgronomyReminderModal({
  isOpen,
  onClose,
  isSunlightMode = false,
}: AgronomyReminderModalProps) {
  const [config, setConfig] = useState<AgronomyReminderConfig>(getAgronomyReminderConfig());
  const [userCrops, setUserCrops] = useState<string[]>([]);
  const [farmLocation, setFarmLocation] = useState<string>('Local Farm & Garden');
  const [testing, setTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Load config and user context
  useEffect(() => {
    if (isOpen) {
      setConfig(getAgronomyReminderConfig());
      getGardenPlants().then((plants) => {
        const names = plants.map((p) => p.name || p.cropId).filter(Boolean);
        setUserCrops(names);
      });
      try {
        const loc = localStorage.getItem('verdescan_farm_location');
        if (loc) setFarmLocation(loc);
      } catch {
        // Fallback
      }
    }
  }, [isOpen]);

  // Click outside and ESC close handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    triggerHaptic('tap');
    const nextState = !config.enabled;

    if (nextState) {
      const granted = await requestReminderNotificationPermission();
      const updated = saveAgronomyReminderConfig({
        enabled: granted,
      });
      setConfig(updated);
      if (granted) {
        triggerHaptic('success');
      }
    } else {
      const updated = saveAgronomyReminderConfig({ enabled: false });
      setConfig(updated);
    }
  };

  const handleTimeChange = (newTime: string) => {
    triggerHaptic('tap');
    const updated = saveAgronomyReminderConfig({ time: newTime });
    setConfig(updated);
  };

  const handleRequestPermission = async () => {
    triggerHaptic('tap');
    const granted = await requestReminderNotificationPermission();
    if (granted) {
      triggerHaptic('success');
      const updated = saveAgronomyReminderConfig({ enabled: true });
      setConfig(updated);
    }
  };

  const handleTestNotification = async () => {
    triggerHaptic('tap');
    setTesting(true);
    setTestStatus(null);

    const result = await triggerTestReminderNotification();
    setTestStatus(result);
    setTesting(false);
  };

  const supported = isNotificationSupported();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
      onClick={(e) => {
        // Touching outside the container closes the popup
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          triggerHaptic('tap');
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all border ${
          isSunlightMode
            ? 'bg-white border-2 border-stone-800 text-stone-900'
            : 'bg-[#F6F8F5] border-[#D8E6D3] text-[#19201D]'
        }`}
      >
        {/* Header */}
        <div className="bg-[#1A3B29] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C441]/20 flex items-center justify-center text-[#78C441]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="reminder-modal-title" className="text-sm font-extrabold tracking-tight text-white">
                Daily Morning Agronomy Reminder
              </h2>
              <p className="text-[10px] text-white/70">
                Localized to your farm crops & seasonal weather
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all touch-target"
            aria-label="Close reminder modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Main Toggle Switch */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E0EBDC] shadow-2xs flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-extrabold text-[#19201D] text-xs block">
                Morning Reminder Alert
              </span>
              <p className="text-[11px] text-[#5E6D65]">
                Receive today&apos;s extension tip at your preferred morning hour
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleEnable}
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors touch-target shrink-0 flex items-center ${
                config.enabled ? 'bg-[#78C441] justify-end' : 'bg-stone-300 justify-start'
              }`}
              aria-label="Toggle morning reminder"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform" />
            </button>
          </div>

          {/* Time Picker */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E0EBDC] shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#19201D]">
              <Clock className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Preferred Morning Time</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleTimeChange(preset.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                    config.time === preset.value
                      ? 'bg-[#EBF7E6] text-[#1B5E20] border border-[#A5D6A7] font-bold shadow-2xs'
                      : 'hover:bg-[#F6F8F5] text-stone-700 border border-transparent'
                  }`}
                >
                  <span className="text-[11px]">{preset.label}</span>
                  {config.time === preset.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Personalization Context Card */}
          <div className="bg-white/80 rounded-2xl p-3 border border-[#E0EBDC] space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2C5E3B] block">
              Reminder Personalization Context
            </span>

            <div className="flex items-center gap-2 text-[11px] text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-[#78C441] shrink-0" />
              <span className="truncate">
                <strong>Location:</strong> {farmLocation}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-700">
              <Sprout className="w-3.5 h-3.5 text-[#78C441] shrink-0" />
              <span className="truncate">
                <strong>Your Crops:</strong>{' '}
                {userCrops.length > 0 ? userCrops.join(', ') : 'All Garden Vegetables'}
              </span>
            </div>
          </div>

          {/* System Notification Permission Status */}
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-[#5E6D65]">Device Push Status:</span>
            {config.permissionState === 'granted' ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Active & Allowed
              </span>
            ) : config.permissionState === 'denied' ? (
              <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <AlertCircle className="w-3 h-3" />
                Blocked in Browser
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="font-bold text-[#2E7D32] underline hover:text-[#1B5E20]"
              >
                Grant Permission
              </button>
            )}
          </div>

          {/* Test Reminder Button & Status */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testing || !supported}
              className="w-full bg-[#1A3B29] hover:bg-[#122B1E] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all touch-target disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#86EFAC]" />
              <span>{testing ? 'Dispatching Test...' : 'Send Test Morning Reminder Now'}</span>
            </button>

            {testStatus && (
              <div
                className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#2E7D32]" />
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>

          {/* Extension Research Citation */}
          <p className="text-[10px] text-stone-500 text-center leading-tight">
            Knowledge base ingested from HortiFresh West Africa (CSIR), Purdue Extension Entomology, UMass Extension, and Texas A&M AgriLife.
          </p>
        </div>
      </div>
    </div>
  );
}
