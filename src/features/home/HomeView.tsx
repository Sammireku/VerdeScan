// Screen 1: Home View with Grow Perfect Plants, Multi-Entity Search (Plants, Diseases, Resources) & Connect Growers
import React, { useState, useMemo } from 'react';
import {
  Search,
  Settings,
  Leaf,
  Scan,
  Diamond,
  Bug,
  ChevronRight,
  Sun,
  Droplets,
  Heart,
  User,
  ShieldCheck,
  Compass,
  Sprout,
  Users,
  BookOpen,
  Recycle,
  AlertTriangle,
  Activity,
  Radar,
  FileSpreadsheet,
  Calculator,
  CalendarClock,
  Clock,
  Microscope,
} from 'lucide-react';
import { KB_CROPS, KB_PROBLEMS, KB_GUIDES } from '@verdescan/kb';
import { WeatherWidget } from '../../components/WeatherWidget';
import { WeatherAlertBanner } from '../../components/WeatherAlertBanner';
import { useAuth } from '../../lib/auth';

export interface HomeViewProps {
  onOpenScan: (mode?: 'identify' | 'diagnose') => void;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
  onOpenAuth: () => void;
  onOpenFindSeeds?: () => void;
  onOpenPlantCare?: () => void;
  onOpenCommunity?: () => void;
  onOpenBotanist?: () => void;
  onSelectCrop?: (cropId: string) => void;
  onOpenRecovery?: () => void;
  onOpenRadar?: () => void;
  onOpenReport?: () => void;
  onOpenCalculator?: () => void;
  onOpenHarvest?: () => void;
}

type SearchFilterTab = 'all' | 'plants' | 'diseases' | 'resources';

export function HomeView({
  onOpenScan,
  onOpenSettings,
  onOpenPremium,
  onOpenAuth,
  onOpenFindSeeds,
  onOpenPlantCare,
  onOpenCommunity,
  onOpenBotanist,
  onSelectCrop,
  onOpenRecovery,
  onOpenRadar,
  onOpenReport,
  onOpenCalculator,
  onOpenHarvest,
}: HomeViewProps) {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState<SearchFilterTab>('all');

  const displayName = currentUser?.name || 'Ryan Schentzer';

  // Multi-entity search across Plants, Diseases, and Resources
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return { plants: [], diseases: [], resources: [], total: 0 };
    }

    // 1. Plants Search
    const matchedPlants = KB_CROPS.filter(
      (c) =>
        c.name.en.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.name.tw?.toLowerCase().includes(q)
    );

    // 2. Diseases & Problems Search
    const matchedDiseases = KB_PROBLEMS.filter(
      (p) =>
        (p.names.en || '').toLowerCase().includes(q) ||
        (p.summary.en || '').toLowerCase().includes(q) ||
        p.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        p.cropIds.some((cropId) => cropId.toLowerCase().includes(q))
    );

    // 3. Resources Search (Hubs, Guides, Tools)
    const fixedResources = [
      {
        id: 'res-plant-care',
        title: 'Plant Care Hub & Best Practices',
        desc: 'Watering rules, soil building, microclimate management',
        type: 'guide',
        action: () => onOpenPlantCare?.(),
      },
      {
        id: 'res-compost-maker',
        title: 'Compost Maker & Recipe Calculator',
        desc: 'Balance Carbon (Browns) and Nitrogen (Greens) 30:1',
        type: 'tool',
        action: () => onOpenPlantCare?.(),
      },
      {
        id: 'res-garden-create',
        title: 'How to Create a Garden from Scratch',
        desc: 'Step-by-step raised bed setup, companion guilds & mulching',
        type: 'guide',
        action: () => onOpenPlantCare?.(),
      },
      {
        id: 'res-find-seeds',
        title: 'Find Seeds & Nearby Agro-Dealers Map',
        desc: 'Certified seed varieties, cooperatives, and seed stores',
        type: 'map',
        action: () => onOpenFindSeeds?.(),
      },
      {
        id: 'res-connect-growers',
        title: 'Connect With Other Growers Community',
        desc: 'Share tips, ideas, organic remedies with nearby farmers',
        type: 'community',
        action: () => onOpenCommunity?.(),
      },
      {
        id: 'res-recovery-tracker',
        title: 'Crop Health & Recovery Tracker',
        desc: 'Before/After slider, recovery score & biological treatment log',
        type: 'tool',
        action: () => onOpenRecovery?.(),
      },
      {
        id: 'res-outbreak-radar',
        title: 'Regional Outbreak Radar & Pest Early Warning',
        desc: 'Bio-surveillance map, risk alerts & preventive checklists',
        type: 'tool',
        action: () => onOpenRadar?.(),
      },
      {
        id: 'res-scouting-report',
        title: 'Professional Field Scouting Report Generator',
        desc: 'GlobalG.A.P. compliant audit report, voice notes & PDF export',
        type: 'tool',
        action: () => onOpenReport?.(),
      },
      {
        id: 'res-spray-calculator',
        title: 'Organic Spray & Dosage Calculator',
        desc: 'Dilution recipes for neem, bicarb, milk & wood ash by plot area',
        type: 'tool',
        action: () => onOpenCalculator?.(),
      },
      {
        id: 'res-harvest-tracker',
        title: 'Harvest & Days-To-Maturity (DTM) Countdown',
        desc: 'Days remaining, maturity progress & visual ripening cues',
        type: 'tool',
        action: () => onOpenHarvest?.(),
      },
    ];

    const matchedFixed = fixedResources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
    );

    const matchedKbGuides = KB_GUIDES.filter(
      (g) =>
        (g.title.en || '').toLowerCase().includes(q) ||
        (g.body.en || '').toLowerCase().includes(q) ||
        g.topic.toLowerCase().includes(q)
    ).map((g) => ({
      id: g.id,
      title: g.title.en,
      desc: `Guide on ${g.topic} • ${g.timeEstimate}`,
      type: 'guide',
      action: () => onOpenPlantCare?.(),
    }));

    const allResources = [...matchedFixed, ...matchedKbGuides];

    return {
      plants: matchedPlants,
      diseases: matchedDiseases,
      resources: allResources,
      total: matchedPlants.length + matchedDiseases.length + allResources.length,
    };
  }, [
    searchQuery,
    onOpenPlantCare,
    onOpenFindSeeds,
    onOpenCommunity,
    onOpenRecovery,
    onOpenRadar,
    onOpenReport,
    onOpenCalculator,
    onOpenHarvest,
  ]);

  return (
    <div className="space-y-4">
      {/* Top Dark Green Hero Section */}
      <div className="bg-[#1A3B29] text-white rounded-b-3xl px-5 pt-4 pb-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative leaf silhouette */}
        <div className="absolute right-0 top-0 w-44 h-44 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C70 30 100 50 100 100 C50 100 30 70 0 50 C30 50 50 30 50 0 Z" />
          </svg>
        </div>

        {/* User Greeting, App Logo & Settings / Profile Buttons */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* App Logo from user upload */}
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md border border-white/20 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_qaoaufqaoaufqaoa_7088432d.jpeg"
                alt="VerdeScan Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs text-white/75 font-medium">Welcome back!</p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-base font-extrabold text-white tracking-tight hover:underline flex items-center gap-1.5 mt-0.5 text-left"
              >
                <span>Hi, {displayName}</span>
                <span className="text-[10px] bg-[#78C441] text-[#122B1E] px-1.5 py-0.2 rounded-full font-bold">
                  {currentUser ? currentUser.role : 'Guest'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Account / Auth Button */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shadow-xs backdrop-blur-md active:scale-95 transition-all touch-target"
              title="Account / Profiles"
              aria-label="Account / Profiles"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-full bg-white text-[#1A3B29] flex items-center justify-center shadow-sm hover:bg-stone-100 active:scale-95 transition-all touch-target"
              title="Open Settings"
              aria-label="Open Settings"
            >
              <Settings className="w-5 h-5 text-[#1A3B29]" />
            </button>
          </div>
        </div>

        {/* Title: Grow perfect Plants (Updated per user request) */}
        <div className="mt-5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Grow perfect <span className="text-[#86EFAC]">Plants</span>
          </h1>

          {/* Unified Search Bar for Plants, Diseases, and Resources */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plants, diseases, symptoms, or guides..."
              className="w-full bg-[#284E39] text-white placeholder-white/50 text-xs sm:text-sm font-medium rounded-2xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#86EFAC] shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Entity Search Dropdown Results with Categories */}
      {searchQuery.trim() && (
        <div className="px-4">
          <div className="bg-white rounded-3xl p-4 border border-[#E6EBE4] shadow-md space-y-3">
            {/* Filter Tabs inside Search Results */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#E6EBE4] pb-2">
              <button
                type="button"
                onClick={() => setSearchTab('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  searchTab === 'all'
                    ? 'bg-[#182635] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:text-black'
                }`}
              >
                All ({searchResults.total})
              </button>
              <button
                type="button"
                onClick={() => setSearchTab('plants')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  searchTab === 'plants'
                    ? 'bg-[#78C441] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:text-black'
                }`}
              >
                🌱 Plants ({searchResults.plants.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchTab('diseases')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  searchTab === 'diseases'
                    ? 'bg-[#3B82F6] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:text-black'
                }`}
              >
                🦠 Diseases ({searchResults.diseases.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchTab('resources')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  searchTab === 'resources'
                    ? 'bg-[#BC4749] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:text-black'
                }`}
              >
                📚 Resources ({searchResults.resources.length})
              </button>
            </div>

            {/* Results List */}
            {searchResults.total === 0 ? (
              <p className="text-xs text-[#5E6D65] py-2 text-center">
                No plants, diseases, or resources matched &ldquo;{searchQuery}&rdquo;. Try another term!
              </p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {/* 1. Plants Group */}
                {(searchTab === 'all' || searchTab === 'plants') &&
                  searchResults.plants.map((crop) => (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => {
                        onSelectCrop?.(crop.id);
                        onOpenScan('diagnose');
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F8F5] text-left transition-colors border border-stone-100 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-bold text-sm shrink-0">
                          🌱
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#19201D]">{crop.name.en}</p>
                          <p className="text-[10px] text-[#5E6D65]">Priority Plant • Tap to inspect</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300" />
                    </button>
                  ))}

                {/* 2. Diseases Group */}
                {(searchTab === 'all' || searchTab === 'diseases') &&
                  searchResults.diseases.map((prob) => (
                    <button
                      key={prob.id}
                      type="button"
                      onClick={() => {
                        if (prob.cropIds[0]) onSelectCrop?.(prob.cropIds[0]);
                        onOpenScan('diagnose');
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F8F5] text-left transition-colors border border-stone-100 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center font-bold text-sm shrink-0">
                          <Bug className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#19201D]">{prob.names.en}</p>
                          <p className="text-[10px] text-[#5E6D65] line-clamp-1">
                            {prob.summary.en || prob.symptoms.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300" />
                    </button>
                  ))}

                {/* 3. Resources Group */}
                {(searchTab === 'all' || searchTab === 'resources') &&
                  searchResults.resources.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        res.action();
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F8F5] text-left transition-colors border border-stone-100 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#19201D]">{res.title}</p>
                          <p className="text-[10px] text-[#5E6D65] line-clamp-1">{res.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-Time Extreme Weather & Frost Alert Banner */}
      <WeatherAlertBanner
        onOpenBotanist={onOpenBotanist}
        onOpenPlantCare={onOpenPlantCare}
      />

      {/* Main Content Area */}
      <div className="px-4 space-y-3.5">
        {/* GEOLOCATION LOCAL WEATHER WIDGET (with Auto & Manual Setting) */}
        <WeatherWidget />

        {/* Card 1: Identify */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs flex items-center justify-between gap-3 hover:border-[#78C441]/40 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6 text-[#FF7F50]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#19201D] leading-tight">Identify</h3>
              <p className="text-xs text-[#5E6D65] mt-0.5">Recognize a plant</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenScan('identify')}
            className="touch-target bg-[#78C441] hover:bg-[#6BB536] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0 min-h-[44px]"
          >
            <Scan className="w-4 h-4" />
            <span>Scan</span>
          </button>
        </div>

        {/* Card 2: Diagnose */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs flex items-center justify-between gap-3 hover:border-[#78C441]/40 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] flex items-center justify-center shrink-0">
              <Bug className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#19201D] leading-tight">Diagnose</h3>
              <p className="text-xs text-[#5E6D65] mt-0.5">Check your plant&apos;s health</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenScan('diagnose')}
            className="touch-target bg-[#78C441] hover:bg-[#6BB536] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0 min-h-[44px]"
          >
            <Scan className="w-4 h-4" />
            <span>Scan</span>
          </button>
        </div>

        {/* Card 3: Try premium feature 🪴 */}
        <div className="bg-[#182635] text-white rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white">
                Try premium feature 🪴
              </span>
            </div>
            <p className="text-[11px] text-slate-300 max-w-[200px] leading-tight">
              Get unlimited Ai botanist suggestions
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPremium}
            className="touch-target bg-[#FF7F50] hover:bg-[#f26a38] text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-sm flex items-center gap-1.5 active:scale-95 transition-all shrink-0 min-h-[44px]"
          >
            <Diamond className="w-3.5 h-3.5 fill-current" />
            <span>Get plus</span>
          </button>
        </div>

        {/* Resource & Tools Strip: Connect Growers, Find Seeds (Map), and Plant Care (Resource Hub) */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* 1. Connect with other growers */}
          <button
            type="button"
            onClick={onOpenCommunity}
            className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] hover:border-[#3B82F6] text-center flex flex-col items-center justify-between min-h-[145px] sm:min-h-[160px] touch-target cursor-pointer shadow-xs hover:shadow-md group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
              <Users className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="space-y-1 w-full my-auto">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#19201D] leading-tight">
                Connect Growers
              </h4>
              <p className="text-[10px] text-[#5E6D65] hidden sm:block leading-tight">
                Share ideas & remedies
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EBF5FF] px-2 py-0.5 rounded-lg">
              Community 🧑‍🌾
            </span>
          </button>

          {/* 2. Find Seeds Nearby Map */}
          <button
            type="button"
            onClick={onOpenFindSeeds}
            className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] hover:border-[#78C441] text-center flex flex-col items-center justify-between min-h-[145px] sm:min-h-[160px] touch-target cursor-pointer shadow-xs hover:shadow-md group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
              <Compass className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div className="space-y-1 w-full my-auto">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#19201D] leading-tight">
                Find Seeds
              </h4>
              <p className="text-[10px] text-[#5E6D65] hidden sm:block leading-tight">
                Certified agro-dealers
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded-lg">
              Seed Map 📍
            </span>
          </button>

          {/* 3. Plant Care Resource Hub */}
          <button
            type="button"
            onClick={onOpenPlantCare}
            className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] hover:border-[#BC4749] text-center flex flex-col items-center justify-between min-h-[145px] sm:min-h-[160px] touch-target cursor-pointer shadow-xs hover:shadow-md group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0EB] text-[#BC4749] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
              <Heart className="w-5 h-5 text-[#BC4749]" />
            </div>
            <div className="space-y-1 w-full my-auto">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#19201D] leading-tight">
                Plant Care
              </h4>
              <p className="text-[10px] text-[#5E6D65] hidden sm:block leading-tight">
                Compost & best practices
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#BC4749] bg-[#FFF0EB] px-2 py-0.5 rounded-lg">
              Resource Hub 📚
            </span>
          </button>
        </div>

        {/* Industry-Grade Agronomy Command Center */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black tracking-wider uppercase text-[#19201D] flex items-center gap-1.5">
              <Microscope className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Industry-Grade Agronomy Tools</span>
            </h4>
            <span className="text-[10px] font-extrabold text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded-full">
              GlobalG.A.P.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Tool 1: Regional Outbreak Radar */}
            <button
              type="button"
              onClick={onOpenRadar}
              className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all p-3.5 rounded-2xl border border-[#E6EBE4] hover:border-[#DC2626] text-left space-y-2 shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Radar className="w-4 h-4 text-[#DC2626]" />
                </div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 animate-pulse">
                  Live Radar
                </span>
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-[#19201D] leading-tight">
                  Outbreak Radar
                </h5>
                <p className="text-[10px] text-[#5E6D65] mt-0.5 leading-snug">
                  Pest & pathogen early warnings in 30km
                </p>
              </div>
            </button>

            {/* Tool 2: Crop Recovery Tracker */}
            <button
              type="button"
              onClick={onOpenRecovery}
              className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all p-3.5 rounded-2xl border border-[#E6EBE4] hover:border-[#78C441] text-left space-y-2 shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Activity className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-green-100 text-[#2D6A4F]">
                  Before/After
                </span>
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-[#19201D] leading-tight">
                  Recovery Tracker
                </h5>
                <p className="text-[10px] text-[#5E6D65] mt-0.5 leading-snug">
                  Slider comparison & recovery score
                </p>
              </div>
            </button>

            {/* Tool 3: Spray Dosage Calculator */}
            <button
              type="button"
              onClick={onOpenCalculator}
              className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all p-3.5 rounded-2xl border border-[#E6EBE4] hover:border-[#2563EB] text-left space-y-2 shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Calculator className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  Dosage Lab
                </span>
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-[#19201D] leading-tight">
                  Spray Calculator
                </h5>
                <p className="text-[10px] text-[#5E6D65] mt-0.5 leading-snug">
                  Neem, milk & bicarb dilution per plot m²
                </p>
              </div>
            </button>

            {/* Tool 4: Field Scouting Report */}
            <button
              type="button"
              onClick={onOpenReport}
              className="bg-white hover:bg-[#F6F8F5] active:scale-98 transition-all p-3.5 rounded-2xl border border-[#E6EBE4] hover:border-[#7C3AED] text-left space-y-2 shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                  PDF Export
                </span>
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-[#19201D] leading-tight">
                  Scouting Report
                </h5>
                <p className="text-[10px] text-[#5E6D65] mt-0.5 leading-snug">
                  Audit cert with voice dictation & stats
                </p>
              </div>
            </button>
          </div>

          {/* Tool 5 Full Width: Harvest & Days to Maturity Countdown */}
          <button
            type="button"
            onClick={onOpenHarvest}
            className="w-full bg-gradient-to-r from-[#1A3B29] to-[#2D6A4F] text-white p-3.5 rounded-2xl border border-[#1A3B29] text-left flex items-center justify-between gap-3 shadow-2xs hover:shadow-md active:scale-98 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                <CalendarClock className="w-5 h-5 text-[#78C441]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-extrabold text-white">Harvest & DTM Countdown</h5>
                  <span className="text-[9px] font-extrabold text-[#122B1E] bg-[#78C441] px-1.5 py-0.2 rounded-md">
                    Ripening Cues
                  </span>
                </div>
                <p className="text-[10px] text-white/75 mt-0.5">
                  Track days remaining to peak picking maturity & optimal curing
                </p>
              </div>
            </div>
            <Clock className="w-4 h-4 text-white/60 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
