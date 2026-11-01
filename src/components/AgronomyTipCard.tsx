// Agronomy Tip of the Day Card
// Ingested from UMass Extension & Texas A&M AgriLife Extension Publications
import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Droplets,
  Sprout,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  BookOpen,
  CheckCircle2,
  Info,
  Bug,
  Bell,
} from 'lucide-react';
import {
  fetchAgronomyTip,
  AgronomyTip,
  selectCuratedFallbackTip,
} from '../lib/agronomy-tips';
import { getGardenPlants, subscribeGarden } from '../lib/garden';
import { triggerHaptic } from '../lib/haptics';
import { useTextToSpeech } from '../lib/speech';
import { AgronomyReminderModal } from './AgronomyReminderModal';
import { getAgronomyReminderConfig, type AgronomyReminderConfig } from '../lib/notification-scheduler';

export interface AgronomyTipCardProps {
  onOpenBotanist?: (prefill?: string) => void;
  isSunlightMode?: boolean;
  className?: string;
}

const CATEGORY_META: Record<
  AgronomyTip['category'],
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  disease_prevention: {
    label: 'Disease Prevention',
    icon: Bug,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  organic_defense: {
    label: 'Organic Biological Shield',
    icon: ShieldCheck,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  water_irrigation: {
    label: 'Irrigation & Moisture Hygiene',
    icon: Droplets,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  soil_health: {
    label: 'Soil Health & Fertility',
    icon: Sprout,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  crop_rotation: {
    label: 'Crop Rotation Protocol',
    icon: RefreshCw,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  pest_vectors: {
    label: 'Vector & Pest Exclusion',
    icon: AlertTriangle,
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
};

export function AgronomyTipCard({
  onOpenBotanist,
  isSunlightMode = false,
  className = '',
}: AgronomyTipCardProps) {
  const [tip, setTip] = useState<AgronomyTip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showExtensionNotes, setShowExtensionNotes] = useState<boolean>(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderConfig, setReminderConfig] = useState<AgronomyReminderConfig>(getAgronomyReminderConfig());
  const [userCrops, setUserCrops] = useState<string[]>([]);
  const { speak, stop, isSpeaking, isSupported: isTtsSupported } = useTextToSpeech();

  // Load user's garden plants
  const loadCrops = useCallback(async () => {
    try {
      const plants = await getGardenPlants();
      const names = plants.map((p) => p.name || p.cropId).filter(Boolean);
      setUserCrops(names);
    } catch {
      setUserCrops([]);
    }
  }, []);

  useEffect(() => {
    loadCrops();
    const unsub = subscribeGarden(() => {
      loadCrops();
    });
    return unsub;
  }, [loadCrops]);

  // Load weather and farm location context
  const loadDailyTip = useCallback(
    async (force = false) => {
      if (force) {
        setRefreshing(true);
        triggerHaptic('tap');
      } else {
        setLoading(true);
      }

      let location = 'Local Farm & Garden';
      let temperature: number | undefined;
      let condition: string | undefined;
      let humidity: number | undefined;

      try {
        const cachedWeather = localStorage.getItem('verdescan_cached_weather');
        if (cachedWeather) {
          const parsed = JSON.parse(cachedWeather);
          temperature = parsed.temp;
          condition = parsed.condition;
          humidity = parsed.humidity;
        }
        const farmLoc = localStorage.getItem('verdescan_farm_location');
        if (farmLoc) {
          location = farmLoc;
        }
      } catch {
        // use defaults
      }

      try {
        const result = await fetchAgronomyTip({
          location,
          temperature,
          condition,
          humidity,
          cropNames: userCrops,
          forceRefresh: force,
        });
        setTip(result);
        if (force) triggerHaptic('success');
      } catch {
        const fallback = selectCuratedFallbackTip({
          location,
          temperature,
          condition,
          cropNames: userCrops,
        });
        setTip(fallback);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userCrops]
  );

  useEffect(() => {
    loadDailyTip(false);
  }, [loadDailyTip]);

  const handleAudioToggle = () => {
    if (!tip) return;
    triggerHaptic('tap');
    if (isSpeaking) {
      stop();
    } else {
      const script = `Agronomy Tip of the Day. ${tip.headline}. ${tip.tip}. Recommended Action: ${tip.actionableStep}`;
      speak(script);
    }
  };

  const handleAskBotanist = () => {
    if (!tip) return;
    triggerHaptic('tap');
    const query = `Can you provide more practical tips on this agronomic practice: "${tip.headline}" (${tip.cropFamilyFocus || 'General Vegetables'})?`;
    onOpenBotanist?.(query);
  };

  const catMeta = tip
    ? CATEGORY_META[tip.category] || CATEGORY_META.disease_prevention
    : CATEGORY_META.disease_prevention;
  const CategoryIcon = catMeta.icon;

  return (
    <div
      className={`rounded-3xl border transition-all overflow-hidden ${
        isSunlightMode
          ? 'bg-white border-2 border-stone-800 shadow-md text-stone-900'
          : 'bg-[#F6F8F5] border-[#D8E6D3] shadow-xs'
      } ${className}`}
    >
      {/* Top Banner Accent */}
      <div className="bg-[#1A3B29] px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#78C441]/20 flex items-center justify-center text-[#78C441]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#86EFAC] block leading-none">
              Agronomy Tip of the Day
            </span>
            <span className="text-[10px] text-white/70 font-medium">
              UMass & Texas A&M Extension Protocol
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Daily Morning Reminder Alarm Config Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setIsReminderModalOpen(true);
            }}
            className={`p-1.5 rounded-full transition-all touch-target flex items-center gap-1 ${
              reminderConfig.enabled
                ? 'bg-[#78C441] text-[#122B1E] font-bold shadow-2xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={
              reminderConfig.enabled
                ? `Morning reminder scheduled for ${reminderConfig.time}`
                : 'Set Daily Morning Agronomy Reminder'
            }
            aria-label="Daily Morning Reminder Alarm"
          >
            <Bell className="w-3.5 h-3.5" />
            {reminderConfig.enabled && (
              <span className="text-[10px] font-black pr-1 hidden xs:inline">
                {reminderConfig.time}
              </span>
            )}
          </button>

          {isTtsSupported && (
            <button
              type="button"
              onClick={handleAudioToggle}
              className={`p-1.5 rounded-full transition-all touch-target ${
                isSpeaking
                  ? 'bg-[#78C441] text-[#122B1E] animate-pulse ring-2 ring-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSpeaking ? 'Mute Audio Readout' : 'Listen to Agronomist Tip'}
              aria-label="Listen to Agronomist"
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => loadDailyTip(true)}
            disabled={refreshing}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 touch-target"
            title="Refresh / Fetch New Tip"
            aria-label="Refresh Agronomy Tip"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#78C441]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {loading && !tip ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#5E6D65]">
            <RefreshCw className="w-5 h-5 animate-spin text-[#78C441]" />
            <p className="text-xs font-semibold">Consulting university extension knowledge base...</p>
          </div>
        ) : tip ? (
          <>
            {/* Badges Bar: Category & Crop Family */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}
              >
                <CategoryIcon className="w-3 h-3 shrink-0" />
                {catMeta.label}
              </span>

              {tip.cropFamilyFocus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
                  <Sprout className="w-3 h-3 shrink-0" />
                  {tip.cropFamilyFocus}
                </span>
              )}

              {tip.seasonContext && (
                <span className="text-[10px] font-semibold text-stone-500 ml-auto hidden sm:inline-block">
                  🌱 {tip.seasonContext}
                </span>
              )}
            </div>

            {/* Headline */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#19201D] leading-tight tracking-tight">
                {tip.headline}
              </h3>
              <p className="text-xs sm:text-sm text-[#3E4D45] mt-1.5 leading-relaxed font-normal">
                {tip.tip}
              </p>
            </div>

            {/* Actionable Step Callout */}
            <div className="bg-white rounded-2xl p-3 border border-[#E0EBDC] shadow-2xs flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#EBF7E6] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#2E7D32]">
                  Agronomic Action For Today
                </span>
                <p className="text-xs text-[#19201D] font-medium leading-snug">
                  {tip.actionableStep}
                </p>
              </div>
            </div>

            {/* Prohibited Practice Warning Callout (if present) */}
            {tip.prohibitedPracticeWarning && (
              <div className="bg-[#FFF4E5] rounded-2xl p-3 border border-[#FFE0B2] shadow-2xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FFE0B2] text-[#E65100] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#E65100]">
                    Extension Safety Warning
                  </span>
                  <p className="text-xs text-[#5D4037] font-medium leading-snug">
                    {tip.prohibitedPracticeWarning}
                  </p>
                </div>
              </div>
            )}

            {/* Actions & Research Citations Drawer Toggle */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setShowExtensionNotes(!showExtensionNotes);
                }}
                className="text-xs font-bold text-[#2C5E3B] hover:text-[#1A3B29] flex items-center gap-1.5 py-1 px-1 text-left transition-colors touch-target"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#78C441]" />
                <span>{showExtensionNotes ? 'Hide Research Citations' : 'Extension Research & Rationale'}</span>
                {showExtensionNotes ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleAskBotanist}
                className="bg-[#1A3B29] hover:bg-[#122B1E] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all touch-target"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span>Ask AI Botanist About This</span>
              </button>
            </div>

            {/* Collapsible Extension Research Notes */}
            {showExtensionNotes && (
              <div className="bg-white/80 rounded-2xl p-3.5 border border-[#E0EBDC] space-y-2 text-xs text-[#3E4D45] animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-bold text-[#1A3B29]">
                  <Info className="w-3.5 h-3.5 text-[#78C441]" />
                  <span>Extension Ingestion Citations</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-[#19201D]">Primary Source:</strong> {tip.extensionSource}
                </p>
                <div className="text-[11px] leading-relaxed bg-[#F8FAF8] p-2.5 rounded-xl border border-stone-200/60 space-y-1">
                  <p className="font-semibold text-[#1A3B29]">
                    The Disease Triangle Principle (Texas A&M & UMass):
                  </p>
                  <p className="text-stone-600">
                    Host + Pathogen + Favorable Environment = Disease. Disruption of leaf wetness and strict botanical family rotations (Solanaceae 2–3 yrs, Alliums 4–5 yrs) suppresses soilborne inocula without toxic synthetic pesticides.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Daily Morning Agronomy Reminder Modal */}
      <AgronomyReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderConfig(getAgronomyReminderConfig());
        }}
        isSunlightMode={isSunlightMode}
      />
    </div>
  );
}
