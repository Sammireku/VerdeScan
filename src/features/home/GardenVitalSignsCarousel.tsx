// T-026: Garden Vital Signs Carousel for HomeView
import React from 'react';
import { Sprout, Activity, Calendar, Droplets, ChevronRight, Heart } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';

interface CropVitalSign {
  id: string;
  name: string;
  variety: string;
  stage: string;
  daysRemaining: number;
  moistureVwc: number;
  healthScore: number; // 0 to 100
  status: 'healthy' | 'thirsty' | 'recovering';
  imageUrl: string;
}

const DEFAULT_VITAL_CROPS: CropVitalSign[] = [
  {
    id: 'vc-1',
    name: 'Roma Tomato',
    variety: 'San Marzano',
    stage: 'Fruiting',
    daysRemaining: 18,
    moistureVwc: 19.4,
    healthScore: 82,
    status: 'thirsty',
    imageUrl: '/assets/plants/roma_tomato_plant.jpg',
  },
  {
    id: 'vc-2',
    name: 'Habanero Pepper',
    variety: 'Caribbean Red',
    stage: 'Fruiting',
    daysRemaining: 21,
    moistureVwc: 36.8,
    healthScore: 94,
    status: 'healthy',
    imageUrl: '/assets/plants/pepper_leaf_healthy.jpg',
  },
  {
    id: 'vc-3',
    name: 'Sweetcorn F1',
    variety: 'Golden Bantam',
    stage: 'Flowering',
    daysRemaining: 17,
    moistureVwc: 26.0,
    healthScore: 74,
    status: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=140&q=80',
  },
  {
    id: 'vc-4',
    name: 'Monstera',
    variety: 'Deliciosa Indoor',
    stage: 'Vegetative',
    daysRemaining: 0,
    moistureVwc: 42.1,
    healthScore: 98,
    status: 'healthy',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=140&q=80',
  },
];

interface GardenVitalSignsCarouselProps {
  onOpenHarvest?: () => void;
  onOpenRecovery?: () => void;
  isSunlightMode?: boolean;
}

export function GardenVitalSignsCarousel({
  onOpenHarvest,
  onOpenRecovery,
  isSunlightMode = false,
}: GardenVitalSignsCarouselProps) {
  const handleSelectCrop = (crop: CropVitalSign) => {
    triggerHaptic('tap');
    if (crop.status === 'thirsty' || crop.status === 'recovering') {
      onOpenRecovery?.();
    } else {
      onOpenHarvest?.();
    }
  };

  const getRingColor = (status: CropVitalSign['status']) => {
    switch (status) {
      case 'thirsty':
        return '#EA580C';
      case 'recovering':
        return '#3B82F6';
      default:
        return '#78C441';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-black tracking-wider uppercase text-[#19201D] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Garden Vital Signs & DTM</span>
        </h4>
        <button
          type="button"
          onClick={onOpenHarvest}
          className="text-[11px] font-bold text-[#2D6A4F] hover:underline flex items-center gap-0.5"
        >
          <span>All Crops</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
        {DEFAULT_VITAL_CROPS.map((crop) => {
          const ringColor = getRingColor(crop.status);
          const circumference = 2 * Math.PI * 22; // radius 22
          const strokeDashoffset = circumference - (crop.healthScore / 100) * circumference;

          return (
            <div
              key={crop.id}
              onClick={() => handleSelectCrop(crop)}
              className={`bg-white hover:bg-slate-50 cursor-pointer active:scale-97 transition-all rounded-2xl p-3 border shadow-xs shrink-0 w-[160px] flex flex-col justify-between space-y-2 ${
                isSunlightMode ? 'border-2 border-stone-800' : 'border-[#E6EBE4]'
              }`}
            >
              {/* Header with Circular Progress Ring */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                  {/* SVG Health Ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
                    <circle
                      cx="26"
                      cy="26"
                      r="22"
                      stroke="#E2E8F0"
                      strokeWidth="3.5"
                      fill="none"
                    />
                    <circle
                      cx="26"
                      cy="26"
                      r="22"
                      stroke={ringColor}
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  {/* Centered Image */}
                  <img
                    src={crop.imageUrl}
                    alt={crop.name}
                    className="w-8 h-8 rounded-full object-cover absolute"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-extrabold text-[#19201D] truncate leading-tight">
                    {crop.name}
                  </h5>
                  <p className="text-[10px] text-[#5E6D65] truncate">{crop.variety}</p>
                </div>
              </div>

              {/* Moisture & Harvest Stats */}
              <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block text-[9px] font-bold">SOIL</span>
                  <span
                    className={`font-black flex items-center gap-0.5 ${
                      crop.moistureVwc < 25 ? 'text-red-600' : 'text-[#2D6A4F]'
                    }`}
                  >
                    <Droplets className="w-2.5 h-2.5" />
                    {crop.moistureVwc}%
                  </span>
                </div>

                <div className="space-y-0.5 text-right">
                  <span className="text-slate-400 block text-[9px] font-bold">HARVEST</span>
                  <span className="font-black text-[#1A3B29]">
                    {crop.daysRemaining > 0 ? `${crop.daysRemaining}d` : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Status footer pill */}
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-[#5E6D65]">{crop.stage}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md ${
                    crop.status === 'thirsty'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-[#2D6A4F]'
                  }`}
                >
                  {crop.healthScore}% health
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
