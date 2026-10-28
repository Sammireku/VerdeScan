// T-025: Interactive Organic Spray & Input Dosage Calculator
import React, { useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Droplets,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Scale,
  Maximize2,
  CheckCircle2,
  SunMedium,
  CloudRain,
} from 'lucide-react';
import { type SprayDosageRecipe } from '@verdescan/shared';

interface SprayDosageCalculatorProps {
  onClose: () => void;
}

const RECIPES: SprayDosageRecipe[] = [
  {
    id: 'rec-neem',
    name: 'Cold-Pressed Neem Oil Emulsion (0.5%)',
    pestOrDiseaseTarget: 'Aphids, Whiteflies, Spider Mites, Thrips, Early Powdery Mildew',
    dilutionRatio: '5 ml Neem Oil + 2 ml Horticultural/Castile Soap per 1 Liter Water',
    baseUnit: 'per_liter',
    ingredients: [
      { name: '100% Pure Cold-Pressed Neem Oil (Azadirachtin)', amountPerBaseUnit: 5, unit: 'ml' },
      { name: 'Castile Soap or Potassium Cocoate Emulsifier', amountPerBaseUnit: 2, unit: 'ml' },
    ],
    mixingSafety: [
      'Emulsify warm neem oil with soap in a small cup before adding to full tank of water',
      'Shake vigorously; spray must appear milky with no floating oil globules',
      'Discard unused spray after 8 hours; azadirachtin degrades rapidly in water',
    ],
    applicationWindow: 'Twilight / sunset only; direct sunlight will burn tender foliage',
    maxFrequencyDays: 7,
    reentryIntervalHours: 4,
  },
  {
    id: 'rec-bicarb',
    name: 'Potassium / Sodium Bicarbonate Wash',
    pestOrDiseaseTarget: 'Powdery Mildew, Black Spot, Leaf Blight Curative',
    dilutionRatio: '4 grams Bicarbonate + 2 ml Vegetable Oil per 1 Liter Water',
    baseUnit: 'per_liter',
    ingredients: [
      { name: 'Potassium Bicarbonate (or Food-Grade Baking Soda)', amountPerBaseUnit: 4, unit: 'grams' },
      { name: 'Light Horticultural Oil (Sticker)', amountPerBaseUnit: 2, unit: 'ml' },
    ],
    mixingSafety: [
      'Alkalinizes leaf surface pH above 8.0, preventing fungal spore germination',
      'Do not exceed recommended concentration to avoid salt leaf-margin necrosis',
    ],
    applicationWindow: 'Early morning after dew evaporates or late afternoon',
    maxFrequencyDays: 10,
    reentryIntervalHours: 2,
  },
  {
    id: 'rec-milk',
    name: 'Dilute Fresh Whey / Milk Antifungal Spray (1:9)',
    pestOrDiseaseTarget: 'Severe Powdery Mildew on Squash, Melons, Cucumbers & Tomatoes',
    dilutionRatio: '100 ml Fresh Milk / Whey to 900 ml Water',
    baseUnit: 'per_liter',
    ingredients: [
      { name: 'Fresh Whole Milk or Whey (Unpasteurized preferred)', amountPerBaseUnit: 100, unit: 'ml' },
    ],
    mixingSafety: [
      'Sunlight reacts with milk proteins (lactoferrin) to generate natural antiseptic free radicals',
      'Must be applied during sunny mornings for antiseptic photochemical activation',
      'Completely food-safe with 0 day pre-harvest interval (PHI)',
    ],
    applicationWindow: 'Bright morning sun (between 8:00 AM - 10:30 AM)',
    maxFrequencyDays: 5,
    reentryIntervalHours: 0,
  },
  {
    id: 'rec-compost-tea',
    name: 'Aerated Actively Brewed Compost Tea (AACT)',
    pestOrDiseaseTarget: 'Foliar Biofilm Shield, Soil Drench, Root Rot Suppression',
    dilutionRatio: '1:4 Dilution with Dechlorinated Water',
    baseUnit: 'per_liter',
    ingredients: [
      { name: 'Mature Finished Compost or Vermicompost Leachate', amountPerBaseUnit: 250, unit: 'ml' },
      { name: 'Blackstrap Unsulfured Molasses (Microbial Food)', amountPerBaseUnit: 2.5, unit: 'ml' },
    ],
    mixingSafety: [
      'Must smell sweet and earthy; discard if sour or anaerobic smelling',
      'Strain through 400-micron mesh to avoid clogging sprayer nozzles',
      'Populates leaf cuticle with billions of beneficial phyllosphere microbes',
    ],
    applicationWindow: 'Overcast morning or late twilight',
    maxFrequencyDays: 14,
    reentryIntervalHours: 0,
  },
  {
    id: 'rec-woodash',
    name: 'Sifted Hardwood Ash & Lime Slurry',
    pestOrDiseaseTarget: 'Flea Beetles, Hornworms, Slugs, Potassium Deficiency',
    dilutionRatio: '20 grams Sifted Wood Ash per 1 Liter Water',
    baseUnit: 'per_liter',
    ingredients: [
      { name: 'Sifted Fine Hardwood Ash (Untreated wood)', amountPerBaseUnit: 20, unit: 'grams' },
    ],
    mixingSafety: [
      'Highly alkaline; wear dust mask and eye goggles during preparation',
      'Creates a gritty desiccant barrier on stems and lower crown',
      'Do not apply on acid-loving crops like blueberries or potatoes',
    ],
    applicationWindow: 'Dry calm afternoon; avoid pre-rain days',
    maxFrequencyDays: 21,
    reentryIntervalHours: 12,
  },
];

type SizingMode = 'area' | 'plants';

export function SprayDosageCalculator({ onClose }: SprayDosageCalculatorProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0].id);
  const [sizingMode, setSizingMode] = useState<SizingMode>('area');
  const [areaSqm, setAreaSqm] = useState<number>(25); // 25 sq meters default
  const [plantCount, setPlantCount] = useState<number>(20); // 20 plants default
  const [foliarCoverage, setFoliarCoverage] = useState<'light' | 'standard' | 'heavy'>('standard');

  const recipe = RECIPES.find((r) => r.id === selectedRecipeId) || RECIPES[0];

  // Water rate calculation:
  // Light coverage: 0.05 L/sqm or 0.08 L/plant
  // Standard: 0.1 L/sqm or 0.15 L/plant
  // Heavy: 0.2 L/sqm or 0.3 L/plant
  const coverageMultiplier =
    foliarCoverage === 'light' ? 0.6 : foliarCoverage === 'heavy' ? 1.6 : 1.0;

  const totalWaterLiters =
    sizingMode === 'area'
      ? Math.max(0.5, Number((areaSqm * 0.1 * coverageMultiplier).toFixed(1)))
      : Math.max(0.5, Number((plantCount * 0.15 * coverageMultiplier).toFixed(1)));

  const totalGallons = Number((totalWaterLiters * 0.264172).toFixed(2));

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="bg-[#1A3B29] text-white rounded-b-3xl px-5 pt-4 pb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#78C441] text-[#122B1E] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Agronomy Lab
            </span>
          </div>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Organic Spray & Dosage</h1>
        <p className="text-xs text-white/75 mt-0.5">
          Science-backed organic dilutions, spray volumes & safety rules based on plot dimensions
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Recipe Horizontal Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {RECIPES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRecipeId(r.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedRecipeId === r.id
                  ? 'bg-[#1A3B29] text-white border-[#1A3B29] shadow-sm'
                  : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-slate-50'
              }`}
            >
              {r.name.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Selected Recipe Banner */}
        <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Target Condition
              </span>
              <h2 className="text-base font-extrabold text-[#19201D] leading-tight">
                {recipe.name}
              </h2>
              <p className="text-xs text-[#2D6A4F] font-semibold mt-0.5">
                Target: {recipe.pestOrDiseaseTarget}
              </p>
            </div>
            <span className="text-xs font-bold text-[#1A3B29] bg-[#E8F5E9] px-2.5 py-1 rounded-full shrink-0">
              Organic
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="font-extrabold text-slate-800">Base Ratio: </span>
            <span>{recipe.dilutionRatio}</span>
          </div>
        </div>

        {/* Plot Dimensions & Sizing Form */}
        <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1A3B29]">
            Step 1: Input Your Field / Plot Size
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSizingMode('area')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                sizingMode === 'area'
                  ? 'bg-[#1A3B29] text-white border-[#1A3B29]'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              By Plot Area (m²)
            </button>
            <button
              type="button"
              onClick={() => setSizingMode('plants')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                sizingMode === 'plants'
                  ? 'bg-[#1A3B29] text-white border-[#1A3B29]'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              By Plant Count (qty)
            </button>
          </div>

          {sizingMode === 'area' ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Plot Area:</span>
                <span className="text-[#2D6A4F] text-sm">{areaSqm} m² (~{(areaSqm * 10.764).toFixed(0)} sq ft)</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={areaSqm}
                onChange={(e) => setAreaSqm(Number(e.target.value))}
                className="w-full accent-[#78C441]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5 m² (Balcony / Bed)</span>
                <span>100 m² (Garden Plot)</span>
                <span>500 m² (Quarter Acre)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Number of Crops / Trees:</span>
                <span className="text-[#2D6A4F] text-sm">{plantCount} plants</span>
              </div>
              <input
                type="range"
                min="2"
                max="200"
                step="2"
                value={plantCount}
                onChange={(e) => setPlantCount(Number(e.target.value))}
                className="w-full accent-[#78C441]"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>2 pots</span>
                <span>50 crops</span>
                <span>200 bushes</span>
              </div>
            </div>
          )}

          {/* Foliar Canopy Density Toggle */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-700 block">Canopy Density:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'standard', 'heavy'] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() => setFoliarCoverage(density)}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                    foliarCoverage === density
                      ? 'bg-[#78C441] text-[#122B1E] border-[#78C441]'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Recipe Output */}
        <div className="bg-[#1A3B29] text-white rounded-3xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase">
                Step 2: Calculated Batch
              </span>
              <h3 className="text-base font-extrabold text-white">Exact Mixing Measurements</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#78C441] font-bold">Total Spray Liquid</p>
              <p className="text-xl font-black">{totalWaterLiters} Liters</p>
              <p className="text-[10px] text-white/60">({totalGallons} Gal)</p>
            </div>
          </div>

          {/* Ingredients Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
              <div>
                <p className="text-xs font-extrabold text-white">Clean Water Carrier</p>
                <p className="text-[10px] text-white/70">Dechlorinated / Well water</p>
              </div>
              <p className="text-base font-black text-[#78C441]">{totalWaterLiters} L</p>
            </div>

            {recipe.ingredients.map((ing, idx) => {
              const exactAmount = Number((ing.amountPerBaseUnit * totalWaterLiters).toFixed(1));
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/10 p-3 rounded-2xl"
                >
                  <div>
                    <p className="text-xs font-extrabold text-white">{ing.name}</p>
                    <p className="text-[10px] text-white/70">
                      Rate: {ing.amountPerBaseUnit} {ing.unit} per 1L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-[#78C441]">
                      {exactAmount} {ing.unit}
                    </p>
                    {ing.unit === 'ml' && (
                      <p className="text-[10px] text-white/60">
                        (~{(exactAmount / 5).toFixed(1)} tsp / {(exactAmount / 15).toFixed(1)} tbsp)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety & Timing Protocol */}
        <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#1A3B29] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#78C441]" />
            Application Window & Field Safety
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#2D6A4F]" />
                Optimal Timing
              </span>
              <p className="font-extrabold text-[#19201D] text-[11px] leading-snug">
                {recipe.applicationWindow}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" />
                Re-entry Interval
              </span>
              <p className="font-extrabold text-[#19201D] text-[11px] leading-snug">
                {recipe.reentryIntervalHours === 0
                  ? '0 hours (Immediate food safe)'
                  : `${recipe.reentryIntervalHours} hours dry foliage wait`}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-slate-700">Mixing Instructions:</p>
            <ul className="space-y-1 text-xs text-[#5E6D65]">
              {recipe.mixingSafety.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#78C441] font-bold">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
