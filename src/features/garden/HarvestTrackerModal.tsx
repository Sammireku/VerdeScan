// T-025: Harvest & Days-to-Maturity (DTM) Countdown & Ripening Guide
import React, { useState } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Scissors,
  Thermometer,
  Droplets,
  Sprout,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { type HarvestTracker, type MaturityStage } from '@verdescan/shared';

interface HarvestTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCrop?: string;
}

const DEFAULT_CROPS: HarvestTracker[] = [
  {
    id: 'harv-1',
    plantId: 'plt-roma-101',
    cropName: 'Roma Plum Tomato',
    variety: 'San Marzano Determinate',
    plantingDate: '2026-09-01',
    daysToMaturity: 75,
    expectedHarvestDate: '2026-11-15',
    daysRemaining: 18,
    progressPercentage: 76,
    currentStage: 'fruiting',
    visualRipeningCues: [
      'Breaker stage: Green fruit shows pink blush at blossom end',
      'Shoulders turn from pale yellow to uniform crimson red',
      'Fruit yields slightly to gentle thumb pressure',
      'Sweet botanical aroma develops around stem calyx',
    ],
    harvestTechnique:
      'Gently twist fruit upward until abscission zone snaps, or cut with sanitized shears leaving 1cm of green pedicel.',
    storageConditions:
      'Store at 13-15°C (55-60°F) in well-ventilated crates; never refrigerate before fully ripe to preserve volatile aromatic compounds.',
  },
  {
    id: 'harv-2',
    plantId: 'plt-chili-204',
    cropName: 'Habanero Hot Pepper',
    variety: 'Caribbean Red',
    plantingDate: '2026-08-15',
    daysToMaturity: 95,
    expectedHarvestDate: '2026-11-18',
    daysRemaining: 21,
    progressPercentage: 78,
    currentStage: 'fruiting',
    visualRipeningCues: [
      'Pods turn from deep forest green to vibrant glossy orange-red',
      'Skin wall thickens with slight longitudinal puckering',
      'Stems show light corking / brown micro-fissures near node',
    ],
    harvestTechnique:
      'Wear protective gloves; use sharp pruning snips to cut 2cm above the crown to avoid ripping branch bark.',
    storageConditions:
      '8-10°C (46-50°F) with 90-95% relative humidity; shelf life 2-3 weeks.',
  },
  {
    id: 'harv-3',
    plantId: 'plt-corn-301',
    cropName: 'Sweetcorn',
    variety: 'Golden Bantam F1',
    plantingDate: '2026-09-10',
    daysToMaturity: 65,
    expectedHarvestDate: '2026-11-14',
    daysRemaining: 17,
    progressPercentage: 74,
    currentStage: 'flowering',
    visualRipeningCues: [
      'Silks turn dark brown and dry to the touch',
      'Ear tip feels blunt and rounded rather than pointed',
      'Kernels exude a milky sweet liquid when pierced with a fingernail (milk stage)',
    ],
    harvestTechnique:
      'Grasp ear firmly and pull downward, then twist abruptly to break shank.',
    storageConditions:
      'Immediate ice chill / hydrocooling to 0°C; sugars convert to starch within 24 hours at ambient temperature.',
  },
];

export function HarvestTrackerModal({
  isOpen,
  onClose,
  defaultCrop,
}: HarvestTrackerModalProps) {
  const [selectedCropId, setSelectedCropId] = useState<string>(DEFAULT_CROPS[0].id);

  if (!isOpen) return null;

  const currentCrop = DEFAULT_CROPS.find((c) => c.id === selectedCropId) || DEFAULT_CROPS[0];

  const stages: { stage: MaturityStage; label: string }[] = [
    { stage: 'seedling', label: 'Seedling' },
    { stage: 'vegetative', label: 'Vegetative' },
    { stage: 'flowering', label: 'Flowering' },
    { stage: 'fruiting', label: 'Fruiting' },
    { stage: 'harvest_ready', label: 'Harvest Ready' },
  ];

  const getStageIndex = (stage: MaturityStage) => {
    return stages.findIndex((s) => s.stage === stage);
  };

  const currentStageIdx = getStageIndex(currentCrop.currentStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-[#1A3B29] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C441] text-[#122B1E] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">Harvest & DTM Guide</h2>
              <p className="text-[11px] text-white/75">
                Days-to-maturity countdown & peak organoleptic ripening cues
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Sheet */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Crop Switcher */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DEFAULT_CROPS.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCropId(crop.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCropId === crop.id
                    ? 'bg-[#1A3B29] text-white border-[#1A3B29]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {crop.cropName}
              </button>
            ))}
          </div>

          {/* DTM Countdown Big Hero Card */}
          <div className="bg-gradient-to-br from-[#1A3B29] to-[#2D6A4F] text-white rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#78C441] uppercase tracking-wider">
                  Maturity Countdown
                </span>
                <h3 className="text-xl font-extrabold text-white">{currentCrop.cropName}</h3>
                <p className="text-xs text-white/80">{currentCrop.variety}</p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-[#78C441]">
                  {currentCrop.daysRemaining}
                </span>
                <span className="text-xs font-bold block text-white/80">days to harvest</span>
              </div>
            </div>

            {/* Maturity Stage Stepper */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-white/90">
                <span>Progress: {currentCrop.progressPercentage}%</span>
                <span>Expected: {currentCrop.expectedHarvestDate}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#78C441] transition-all duration-500"
                  style={{ width: `${currentCrop.progressPercentage}%` }}
                />
              </div>

              {/* Stage Indicators */}
              <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                {stages.map((stg, idx) => {
                  const isDone = idx <= currentStageIdx;
                  return (
                    <div key={stg.stage} className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          isDone ? 'bg-[#78C441]' : 'bg-white/20'
                        }`}
                      />
                      <span
                        className={`text-[9px] block leading-tight font-bold ${
                          idx === currentStageIdx
                            ? 'text-[#78C441]'
                            : isDone
                            ? 'text-white/80'
                            : 'text-white/40'
                        }`}
                      >
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual Ripening Cues Checklist */}
          <div className="bg-white rounded-3xl p-4 border border-[#E6EBE4] shadow-xs space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A3B29] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              Visual Ripening Indicators
            </h4>
            <div className="space-y-2">
              {currentCrop.visualRipeningCues.map((cue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Harvest & Storage Technical Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F8FAF9] p-3.5 rounded-2xl border border-[#D1E0D7] space-y-1.5">
              <span className="font-extrabold text-[#1A3B29] flex items-center gap-1 text-[11px] uppercase">
                <Scissors className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Picking Technique
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {currentCrop.harvestTechnique}
              </p>
            </div>

            <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border border-[#FDE68A] space-y-1.5">
              <span className="font-extrabold text-[#92400E] flex items-center gap-1 text-[11px] uppercase">
                <Thermometer className="w-3.5 h-3.5 text-[#D97706]" />
                Storage Atmosphere
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {currentCrop.storageConditions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
