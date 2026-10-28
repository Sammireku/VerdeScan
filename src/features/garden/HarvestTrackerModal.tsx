// T-025: Harvest & Days-to-Maturity (DTM) Countdown & Ripening Guide
// Dynamically bound exclusively to crops in the user's Plant List
import React, { useState, useEffect, useMemo } from 'react';
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
  PlusCircle,
  Plant as PlantIcon,
} from 'lucide-react';
import { type HarvestTracker, type MaturityStage, type Plant } from '@verdescan/shared';
import { getGardenPlants, subscribeGarden, addGardenPlant, saveCustomCrop } from '../../lib/garden';
import { triggerHaptic } from '../../lib/haptics';

interface HarvestTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCrop?: string;
  onNavigateToPlants?: () => void;
}

interface CropAgronomyProfile {
  dtm: number;
  stages: MaturityStage[];
  cues: string[];
  harvestTechnique: string;
  storageConditions: string;
}

const AGRONOMY_KNOWLEDGE: Record<string, CropAgronomyProfile> = {
  tomato: {
    dtm: 75,
    stages: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest_ready'],
    cues: [
      'Breaker stage: Green fruit shows pink blush at blossom end',
      'Shoulders turn from pale yellow to uniform crimson red',
      'Fruit yields slightly to gentle thumb pressure with glossy skin',
      'Sweet botanical aroma develops around stem calyx',
    ],
    harvestTechnique:
      'Gently twist fruit upward until the natural abscission zone snaps, or cut with sanitized shears leaving 1cm of green pedicel.',
    storageConditions:
      'Store at 13-15°C (55-60°F) in well-ventilated crates. Never refrigerate unripe tomatoes to preserve volatile aroma esters.',
  },
  pepper: {
    dtm: 95,
    stages: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest_ready'],
    cues: [
      'Pods turn from deep forest green to vibrant glossy orange, yellow, or crimson',
      'Skin wall thickens with slight longitudinal puckering and firm resistance',
      'Stems show light corking / brown micro-fissures near the node',
      'Capsaicin heat and pungent aroma peak when color transition is 100% complete',
    ],
    harvestTechnique:
      'Wear protective gloves; use sharp pruning snips to cut 2cm above the crown to avoid tearing branch bark.',
    storageConditions:
      'Store at 8-10°C (46-50°F) with 90-95% relative humidity. Shelf life 2-3 weeks.',
  },
  corn: {
    dtm: 65,
    stages: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest_ready'],
    cues: [
      'Silks turn dark brown and dry to the touch',
      'Ear tip feels blunt and rounded rather than tapered',
      'Kernels exude a milky sweet liquid when pierced with a thumbnail (milk stage)',
      'Husk fits tightly with rich green color',
    ],
    harvestTechnique:
      'Grasp ear firmly, pull downward, and twist abruptly to snap the shank clean off the stalk.',
    storageConditions:
      'Immediate hydrocooling to 0°C (32°F); sugars convert rapidly to starch within 24 hours at ambient temperature.',
  },
  cabbage: {
    dtm: 70,
    stages: ['seedling', 'vegetative', 'flowering', 'harvest_ready'],
    cues: [
      'Head feels solidly packed and firm when squeezed with both hands',
      'Outer wrapper leaves begin to curl backward',
      'Head reaches target diameter (15-20cm) before split occurs',
    ],
    harvestTechnique:
      'Cut head at base with a sharp sanitized knife, leaving 2-3 outer wrapper leaves for natural physical protection.',
    storageConditions:
      '0-2°C (32-35°F) at 95-98% relative humidity. Keep away from ethylene-producing fruits.',
  },
  okra: {
    dtm: 55,
    stages: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest_ready'],
    cues: [
      'Pods reach 5-9cm (2-3.5 inches) length while still tender',
      'Pod tip snaps crisply when bent gently; if tough or fibrous, it is over-mature',
      'Glossy bright green pods without woody ridges',
    ],
    harvestTechnique:
      'Wear gloves to prevent skin irritation from pod spines; snip stem with shears every 2-3 days.',
    storageConditions:
      '7-10°C (45-50°F) at 90-95% humidity. Consume or process within 4-7 days.',
  },
  cassava: {
    dtm: 240,
    stages: ['seedling', 'vegetative', 'fruiting', 'harvest_ready'],
    cues: [
      'Lower leaves naturally yellow and drop as energy stores into storage roots',
      'Root crown diameter reaches 5-8cm at ground line',
      'Sampling test root shows crisp white or yellow starch interior',
    ],
    harvestTechnique:
      'Cut stem 20cm above soil, loosen earth with a digging fork, and pull vertically without snapping storage roots.',
    storageConditions:
      'Process or cook within 48-72 hours of harvest to prevent physiological post-harvest deterioration (PPD).',
  },
  onion: {
    dtm: 90,
    stages: ['seedling', 'vegetative', 'fruiting', 'harvest_ready'],
    cues: [
      'Foliage necks soften and 50-70% of tops fall over naturally',
      'Outer papery bulb tunic turns golden brown or purple',
      'Bulbs surface above soil level and shoulders firm up',
    ],
    harvestTechnique:
      'Pull gently by hand on a dry morning; field-cure on racks under shade for 10-14 days until neck is fully dry.',
    storageConditions:
      '0-4°C (32-40°F) with low relative humidity (65-70%) and strong ventilation to prevent mold.',
  },
  general: {
    dtm: 75,
    stages: ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest_ready'],
    cues: [
      'Foliage or fruit exhibits species-typical mature color and firmness',
      'Active vegetative elongation slows as biological maturity is reached',
      'Aroma and sugar content peak during early morning hours',
    ],
    harvestTechnique:
      'Use sanitized sharp shears during cool early morning hours to preserve cell turgidity and shelf life.',
    storageConditions:
      'Store in shaded, cool, well-ventilated crates with controlled moisture based on plant type.',
  },
};

function getAgronomyProfile(cropIdOrName: string): CropAgronomyProfile {
  const norm = cropIdOrName.toLowerCase();
  for (const [key, profile] of Object.entries(AGRONOMY_KNOWLEDGE)) {
    if (norm.includes(key)) return profile;
  }
  return AGRONOMY_KNOWLEDGE.general;
}

export function HarvestTrackerModal({
  isOpen,
  onClose,
  defaultCrop,
  onNavigateToPlants,
}: HarvestTrackerModalProps) {
  const [userPlants, setUserPlants] = useState<Plant[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's actual plants from Dexie database & listen to updates
  useEffect(() => {
    let mounted = true;
    const fetchPlants = async () => {
      try {
        const plants = await getGardenPlants();
        if (mounted) {
          setUserPlants(plants);
          setIsLoading(false);
        }
      } catch {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPlants();
    const unsubscribe = subscribeGarden(() => {
      fetchPlants();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isOpen]);

  // Build dynamic HarvestTracker cards EXCLUSIVELY for crops in the user's plant list
  const userTrackedCrops: HarvestTracker[] = useMemo(() => {
    if (!userPlants || userPlants.length === 0) return [];

    return userPlants.map((plant) => {
      const profile = getAgronomyProfile(`${plant.cropId} ${plant.nickname}`);
      const plantDateStr =
        plant.plantingDate ||
        (plant.createdAt ? plant.createdAt.split('T')[0] : '2026-09-01');

      const plantingTime = new Date(plantDateStr).getTime();
      const now = Date.now();
      const elapsedDays = Math.max(1, Math.floor((now - plantingTime) / (1000 * 60 * 60 * 24)));
      const dtm = profile.dtm;
      const daysRemaining = Math.max(0, dtm - elapsedDays);
      const progressPercentage = Math.min(100, Math.round((elapsedDays / dtm) * 100));

      // Calculate expected harvest date
      const harvestDateObj = new Date(plantingTime + dtm * 24 * 60 * 60 * 1000);
      const expectedHarvestDate = harvestDateObj.toISOString().split('T')[0];

      // Determine maturity stage
      let currentStage: MaturityStage = 'seedling';
      if (progressPercentage >= 95) currentStage = 'harvest_ready';
      else if (progressPercentage >= 70) currentStage = 'fruiting';
      else if (progressPercentage >= 45) currentStage = 'flowering';
      else if (progressPercentage >= 20) currentStage = 'vegetative';

      return {
        id: plant.id,
        plantId: plant.id,
        cropName: plant.nickname || plant.cropId,
        variety: plant.cropVariety || plant.variety || 'Open-Pollinated Field Selection',
        plantingDate: plantDateStr,
        daysToMaturity: dtm,
        expectedHarvestDate,
        daysRemaining,
        progressPercentage,
        currentStage,
        visualRipeningCues: profile.cues,
        harvestTechnique: profile.harvestTechnique,
        storageConditions: profile.storageConditions,
      };
    });
  }, [userPlants]);

  // Keep selected crop ID synced
  useEffect(() => {
    if (userTrackedCrops.length > 0) {
      if (!selectedCropId || !userTrackedCrops.some((c) => c.id === selectedCropId)) {
        if (defaultCrop) {
          const match = userTrackedCrops.find(
            (c) =>
              c.cropName.toLowerCase().includes(defaultCrop.toLowerCase()) ||
              c.variety.toLowerCase().includes(defaultCrop.toLowerCase())
          );
          setSelectedCropId(match ? match.id : userTrackedCrops[0].id);
        } else {
          setSelectedCropId(userTrackedCrops[0].id);
        }
      }
    }
  }, [userTrackedCrops, defaultCrop, selectedCropId]);

  if (!isOpen) return null;

  const currentCrop =
    userTrackedCrops.find((c) => c.id === selectedCropId) || userTrackedCrops[0];

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

  const currentStageIdx = currentCrop ? getStageIndex(currentCrop.currentStage) : 0;

  // Quick action to seed standard starter garden crops if user's list is empty
  const handleSeedSampleGarden = async () => {
    triggerHaptic('tap');
    const samples: Plant[] = [
      {
        id: `plt-roma-${Date.now()}`,
        cropId: 'tomato',
        nickname: 'Roma Plum Tomato',
        variety: 'San Marzano Determinate',
        cropVariety: 'San Marzano Determinate',
        plantingDate: '2026-09-01',
        source: 'Packaged Certified Seeds',
        environment: 'Raised Bed / Soil',
        location: 'bed',
        sunExposure: 'full',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        id: `plt-chili-${Date.now() + 1}`,
        cropId: 'pepper',
        nickname: 'Habanero Hot Pepper',
        variety: 'Caribbean Red',
        cropVariety: 'Caribbean Red F1',
        plantingDate: '2026-08-15',
        source: 'Nursery Seedling Transplant',
        environment: 'Balcony / Container',
        location: 'container',
        sunExposure: 'full',
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: `plt-corn-${Date.now() + 2}`,
        cropId: 'corn',
        nickname: 'Sweetcorn Plot',
        variety: 'Golden Bantam Heirloom',
        cropVariety: 'Golden Bantam',
        plantingDate: '2026-09-10',
        source: 'Packaged Certified Seeds',
        environment: 'Open Agricultural Field',
        location: 'field',
        sunExposure: 'full',
        createdAt: '2026-09-10T08:00:00Z',
      },
    ];

    for (const p of samples) {
      saveCustomCrop(p.nickname);
      await addGardenPlant(p);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic('tap');
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
      >
        {/* Tactile Grab Handle Bar */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto my-2 shrink-0 sm:hidden" />

        {/* Top Header */}
        <div className="bg-[#1A3B29] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C441] text-[#122B1E] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">Harvest & DTM Guide</h2>
              <p className="text-[11px] text-white/75">
                Personalized countdowns for crops active in your plant list
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Sheet */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p>Loading your garden plants...</p>
            </div>
          ) : userTrackedCrops.length === 0 ? (
            /* Empty State: No crops in user's plant list */
            <div className="bg-[#F8FAF9] rounded-3xl p-6 text-center border border-[#D1E0D7] space-y-3.5 my-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] mx-auto flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#19201D]">
                  No Crops in Your Plant List
                </h3>
                <p className="text-xs text-[#5E6D65] max-w-sm mx-auto leading-relaxed">
                  The Harvest & Days-to-Maturity Guide shows countdowns only for plants currently in
                  your garden. Add crops to My Garden to track ripening cues and harvest timings.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleSeedSampleGarden}
                  className="bg-[#78C441] hover:bg-[#6BB536] text-[#122B1E] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Seed Sample Garden Crops</span>
                </button>
                {onNavigateToPlants && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToPlants();
                    }}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    Go to My Garden
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* User Crop Selector Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#5E6D65] font-bold">
                  <span>YOUR GARDEN CROPS ({userTrackedCrops.length})</span>
                  <span className="text-[#2D6A4F]">Active in My Plants</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {userTrackedCrops.map((crop) => (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        setSelectedCropId(crop.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        selectedCropId === crop.id
                          ? 'bg-[#1A3B29] text-white border-[#1A3B29] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {crop.cropName}
                    </button>
                  ))}
                </div>
              </div>

              {/* DTM Countdown Big Hero Card */}
              <div className="bg-gradient-to-br from-[#1A3B29] to-[#2D6A4F] text-white rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#78C441] uppercase tracking-wider">
                      Maturity Countdown
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{currentCrop.cropName}</h3>
                    <p className="text-xs text-white/80 font-medium">
                      {currentCrop.variety} • Planted {currentCrop.plantingDate}
                    </p>
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
                    Harvest Technique
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {currentCrop.harvestTechnique}
                  </p>
                </div>

                <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border border-[#FDE68A] space-y-1.5">
                  <span className="font-extrabold text-[#92400E] flex items-center gap-1 text-[11px] uppercase">
                    <Thermometer className="w-3.5 h-3.5 text-[#D97706]" />
                    Post-Harvest Storage
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {currentCrop.storageConditions}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
