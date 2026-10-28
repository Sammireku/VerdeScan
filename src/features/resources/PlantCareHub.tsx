// Plant Care & Gardening Resource Hub: Best Practices, Garden Creation, Compost Maker & Natural Remedies
import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Sprout,
  Droplets,
  Sun,
  ShieldCheck,
  Recycle,
  CheckCircle2,
  Sparkles,
  Layers,
  Heart,
  Calendar,
  AlertCircle,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export interface PlantCareHubProps {
  onClose: () => void;
  onOpenScan?: () => void;
}

type ResourceTab = 'practices' | 'create_garden' | 'compost' | 'pest_defense';

export function PlantCareHub({ onClose, onOpenScan }: PlantCareHubProps) {
  const [activeTab, setActiveTab] = useState<ResourceTab>('practices');

  // Interactive Compost Calculator State
  const [selectedGreens, setSelectedGreens] = useState<string[]>([
    'vegetable_scraps',
    'coffee_grounds',
  ]);
  const [selectedBrowns, setSelectedBrowns] = useState<string[]>([
    'dry_leaves',
    'cardboard',
  ]);
  const [compostTurnFreq, setCompostTurnFreq] = useState<'weekly' | 'biweekly' | 'never'>('weekly');

  const toggleGreen = (item: string) => {
    setSelectedGreens((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleBrown = (item: string) => {
    setSelectedBrowns((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Calculate compost health score
  const greenCount = selectedGreens.length;
  const brownCount = selectedBrowns.length;
  const ratioBalance =
    greenCount > 0 && brownCount > 0
      ? Math.abs(brownCount - greenCount * 1.5) <= 1
        ? 'Optimal Balance (30:1 C:N)'
        : brownCount > greenCount
        ? 'High Carbon (Add more greens/moisture)'
        : 'High Nitrogen (Add more browns/aeration)'
      : 'Incomplete Mixture';

  return (
    <div className="space-y-4 px-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] flex items-center justify-center text-[#19201D] hover:bg-stone-50 shadow-2xs touch-target"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight leading-none">
              Plant Care Hub
            </h1>
            <p className="text-[11px] text-[#5E6D65] mt-0.5 font-medium">
              Guides, best practices & compost maker
            </p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shadow-2xs">
          <Heart className="w-4 h-4" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1A3B29] to-[#2D6A4F] text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#86EFAC] bg-white/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Master Agronomy Library</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold leading-tight">
            Nurture Healthy Soil & Thriving Crops
          </h2>
          <p className="text-xs text-white/80 max-w-sm">
            Everything you need for successful organic gardening, soil regeneration, and pest prevention.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-20 pointer-events-none">
          <Sprout className="w-full h-full" />
        </div>
      </div>

      {/* Resource Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'practices', label: 'Best Practices', icon: BookOpen },
          { id: 'create_garden', label: 'Create a Garden', icon: Sprout },
          { id: 'compost', label: 'Compost Maker', icon: Recycle },
          { id: 'pest_defense', label: 'Natural Defense', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ResourceTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all touch-target min-h-[40px] shadow-2xs ${
                isActive
                  ? 'bg-[#182635] text-white'
                  : 'bg-white border border-[#E6EBE4] text-[#5E6D65] hover:text-[#19201D]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#78C441]' : 'text-[#5E6D65]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BEST PRACTICES */}
      {activeTab === 'practices' && (
        <div className="space-y-3.5">
          {/* Card: The 4 Golden Rules */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EBF5FF] text-[#3B82F6] flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#19201D]">Watering Precision</h3>
                <p className="text-[11px] text-[#5E6D65]">Root health & fungal prevention</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#19201D] leading-relaxed">
              <div className="flex items-start gap-2 bg-[#F6F8F5] p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">The 2-Inch Knuckle Test:</span> Insert your finger
                  into the soil. Only water when the top 2 inches feel dry to prevent root rot.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-[#F6F8F5] p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Morning Irrigation:</span> Water before 8:00 AM at
                  ground level. Avoid splashing leaves to prevent fungal spore germination.
                </div>
              </div>
              <div className="flex items-start gap-2 bg-[#F6F8F5] p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Drainage Guarantee:</span> Ensure all pots have open
                  holes. Discard saucer runoff after 20 minutes to maintain oxygen in roots.
                </div>
              </div>
            </div>
          </div>

          {/* Card: Sunlight & Microclimate */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF8EB] text-[#E09F3E] flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#19201D]">Sunlight & Airflow</h3>
                <p className="text-[11px] text-[#5E6D65]">Optimizing energy and respiration</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#F6F8F5] space-y-1">
                <span className="font-bold text-[#19201D]">Full Sun (6+ hrs)</span>
                <p className="text-[11px] text-[#5E6D65]">
                  Tomatoes, Peppers, Okra, Maize, Cassava, Watermelon.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F8F5] space-y-1">
                <span className="font-bold text-[#19201D]">Dappled / Shade</span>
                <p className="text-[11px] text-[#5E6D65]">
                  Monstera, Snake Plant, Peace Lily, Lettuce, Spinach, Mint.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Tool Hygiene & Pruning */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-[#19201D]">Tool Sanitation</h3>
            </div>
            <p className="text-xs text-[#5E6D65] leading-relaxed">
              Always sanitize pruning shears with 70% isopropyl alcohol or bleach solution between plants.
              This single practice stops 90% of viral and bacterial cross-contamination in backyard plots!
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: HOW TO CREATE A GARDEN */}
      {activeTab === 'create_garden' && (
        <div className="space-y-3.5">
          <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#19201D]">
              5 Steps to Build a Thriving Garden
            </h3>

            <div className="space-y-3">
              {[
                {
                  step: '01',
                  title: 'Select & Map the Site',
                  desc: 'Pick an area with at least 6 hours of direct sunlight and quick access to a water source. Note prevailing wind directions.',
                },
                {
                  step: '02',
                  title: 'Choose Your Bed Type',
                  desc: 'Raised beds (12-18 inches deep) prevent soil compaction and drain best. For balconies, use 5-gallon food-safe containers with drainage holes.',
                },
                {
                  step: '03',
                  title: 'Build the Living Soil',
                  desc: 'Never use plain excavated backyard clay. Mix 50% topsoil, 30% organic compost or worm castings, and 20% coarse perlite, rice husks, or sharp sand.',
                },
                {
                  step: '04',
                  title: 'Companion Planting Guilds',
                  desc: 'Plant African Marigolds next to tomatoes to repel root nematodes. Interplant basil to deter hornworms and whiteflies.',
                },
                {
                  step: '05',
                  title: 'Mulch Every Square Inch',
                  desc: 'Cover exposed soil with 2 inches of dried grass, straw, or wood shavings. Mulch retains 70% of moisture and stops weed seeds from sprouting.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 bg-[#F6F8F5] p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-[#182635] text-[#78C441] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#19201D]">{item.title}</h4>
                    <p className="text-[11px] text-[#5E6D65] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPOST MAKER & CALCULATOR */}
      {activeTab === 'compost' && (
        <div className="space-y-3.5">
          {/* Compost Science Banner */}
          <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center">
                <Recycle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#19201D]">The Compost Formula</h3>
                <p className="text-[11px] text-[#5E6D65]">Balanced Carbon to Nitrogen (30:1)</p>
              </div>
            </div>

            <p className="text-xs text-[#5E6D65] leading-relaxed">
              Compost decomposes via aerobic microbes. To build black gold, balance moist, nitrogen-rich
              <strong className="text-[#2D6A4F]"> Greens</strong> with dry, carbon-rich
              <strong className="text-[#8B5E3C]"> Browns</strong>.
            </p>

            {/* Interactive Calculator */}
            <div className="space-y-3 pt-2 border-t border-[#E6EBE4]">
              {/* Green Ingredients Selection */}
              <div>
                <label className="text-xs font-bold text-[#2D6A4F] block mb-1.5">
                  Greens (Nitrogen Sources - Protein & Moisture):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vegetable_scraps', label: '🥦 Kitchen Scraps' },
                    { id: 'coffee_grounds', label: '☕ Coffee Grounds' },
                    { id: 'fresh_grass', label: '🌱 Fresh Grass' },
                    { id: 'manure', label: '🐑 Herbivore Manure' },
                  ].map((g) => {
                    const isChecked = selectedGreens.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGreen(g.id)}
                        className={`p-2.5 rounded-xl text-[11px] font-bold text-left transition-all border ${
                          isChecked
                            ? 'bg-[#D8F3DC] border-[#78C441] text-[#1B4332]'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brown Ingredients Selection */}
              <div>
                <label className="text-xs font-bold text-[#8B5E3C] block mb-1.5">
                  Browns (Carbon Sources - Aeration & Structure):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dry_leaves', label: '🍂 Dry Brown Leaves' },
                    { id: 'cardboard', label: '📦 Shredded Cardboard' },
                    { id: 'wood_chips', label: '🪵 Wood Shavings' },
                    { id: 'straw', label: '🌾 Dried Straw' },
                  ].map((b) => {
                    const isChecked = selectedBrowns.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBrown(b.id)}
                        className={`p-2.5 rounded-xl text-[11px] font-bold text-left transition-all border ${
                          isChecked
                            ? 'bg-[#FBE9E7] border-[#FF8A65] text-[#BF360C]'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Turning Frequency */}
              <div>
                <label className="text-xs font-bold text-[#19201D] block mb-1.5">
                  Pile Aeration Schedule:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'weekly', label: 'Every 7 days' },
                    { id: 'biweekly', label: 'Every 14 days' },
                    { id: 'never', label: 'Passive (Static)' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setCompostTurnFreq(freq.id as typeof compostTurnFreq)}
                      className={`py-2 px-2 rounded-xl text-[10px] font-bold text-center border transition-all ${
                        compostTurnFreq === freq.id
                          ? 'bg-[#182635] text-white border-[#182635]'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Health Result Box */}
              <div className="bg-[#1A3B29] text-white p-4 rounded-2xl space-y-1 mt-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-[#86EFAC]">Batch Diagnostics:</span>
                  <span className="bg-[#78C441] text-[#1A3B29] px-2 py-0.5 rounded-md text-[10px]">
                    {ratioBalance}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed pt-1">
                  {compostTurnFreq === 'weekly'
                    ? '🚀 Rapid thermophilic cycle: Estimated readiness in 6-8 weeks at 55°C internal core heat.'
                    : '🌿 Steady cold cure: Ready in 4-6 months with rich earthy crumb structure.'}
                </p>
              </div>
            </div>
          </div>

          {/* What NEVER to compost */}
          <div className="bg-red-50 rounded-3xl p-4 border border-red-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-red-800 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Never Add to Backyard Compost:</span>
            </div>
            <p className="text-red-700 text-[11px] leading-relaxed">
              Meat, dairy, oils, diseased crop foliage (e.g. late blight or virus-infected leaves),
              and dog/cat feces. These attract rodents and preserve crop pathogens.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: NATURAL PEST DEFENSE */}
      {activeTab === 'pest_defense' && (
        <div className="space-y-3.5">
          <div className="bg-white rounded-3xl p-5 border border-[#E6EBE4] shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#19201D]">
              KB-Reviewed Organic Pest Protocols
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F6F8F5] border border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#19201D]">
                    Cold-Pressed Neem Oil Foliar Spray
                  </h4>
                  <span className="text-[10px] bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-md font-bold">
                    Aphids, Mites, Whiteflies
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6D65] leading-relaxed">
                  Mix 5 ml cold-pressed neem oil + 2 ml mild potassium soap into 1 liter of warm water.
                  Shake vigorously and spray leaf undersides in the late afternoon.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F8F5] border border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#19201D]">Milk-Water Antifungal Wash</h4>
                  <span className="text-[10px] bg-[#EBF5FF] text-[#2563EB] px-2 py-0.5 rounded-md font-bold">
                    Powdery Mildew
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6D65] leading-relaxed">
                  Dilute fresh milk with water at 1:9 ratio. Spray once weekly in bright morning sunlight.
                  Lactoferrin proteins in milk naturally break down fungal mycelium!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F8F5] border border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#19201D]">Wood Ash Soil Ring</h4>
                  <span className="text-[10px] bg-[#FFF8EB] text-[#D97706] px-2 py-0.5 rounded-md font-bold">
                    Slugs, Snails & Cutworms
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6D65] leading-relaxed">
                  Sprinkle a dry 2-inch band of hardwood ash around the base of vulnerable seedlings.
                  The desiccant alkalinity prevents chewing pests from crossing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
