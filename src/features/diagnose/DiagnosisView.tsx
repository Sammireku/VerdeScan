// Screen 2: Diagnosis Screen matching uploaded UI design exactly
import React, { useState } from 'react';
import { History, ChevronRight, ShieldAlert } from 'lucide-react';
import { KB_PROBLEMS } from '@verdescan/kb';
import type { KbProblem } from '@verdescan/shared';

export interface DiagnosisViewProps {
  onOpenScan: () => void;
  onOpenHistory: () => void;
  onSelectProblem?: (problem: KbProblem) => void;
}

export type ProblemCategoryFilter =
  | 'all'
  | 'fungal'
  | 'viral'
  | 'nematodes'
  | 'pests'
  | 'deficiencies';

// Curated problem list matching the uploaded UI mockup + VerdeScan KB
const MOCKUP_PROBLEMS = [
  {
    id: 'powdery-mildew',
    name: 'Powdery Mildew',
    category: 'fungal',
    image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=300&q=80',
    description: 'White, powdery fungal growth on leaves and stems. Weakens plants by blocking sunlight.',
    symptoms: [
      'Talcum-powder like white spots on leaf surfaces',
      'Leaves curl upward and turn yellow',
      'Premature leaf fall in warm dry conditions',
    ],
    organicRemedy: 'Spray potassium bicarbonate solution or diluted milk (40/60 with water) in morning sun.',
  },
  {
    id: 'downy-mildew',
    name: 'Downy Mildew',
    category: 'fungal',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80',
    description: 'Yellow leaf spots with fuzzy gray/purple undersides. Thrives in cool, wet conditions.',
    symptoms: [
      'Angular yellow spots bound by leaf veins',
      'Fuzzy grayish-purple sporulation underneath',
      'Rapid leaf browning during wet mornings',
    ],
    organicRemedy: 'Prune lower leaves to enhance airflow; apply copper hydroxide spray adhering strictly to label.',
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'fungal',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=300&q=80',
    description: 'Rust-colored pustules on leaves/stems, causing premature leaf drop.',
    symptoms: [
      'Reddish-orange or golden powdery spore pustules',
      'Severe chlorosis surrounding rust pustules',
      'Premature defoliation reducing harvest yield',
    ],
    organicRemedy: 'Immediately remove infected leaves and destroy; apply sulfur dust or wettable sulfur.',
  },
  {
    id: 'clubroot',
    name: 'Clubroot',
    category: 'nematodes',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=300&q=80',
    description: 'Swollen, distorted roots; stunts growth.',
    symptoms: [
      'Knobby, swollen club-like root galling',
      'Mid-day wilting despite moist soil',
      'Stunted growth and purple leaf tints',
    ],
    organicRemedy: 'Raise soil pH above 7.2 using agricultural lime; practice strict 5-year brassica crop rotation.',
  },
  {
    id: 'tomato-early-blight',
    name: 'Early Blight',
    category: 'fungal',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a47?auto=format&fit=crop&w=300&q=80',
    description: 'Dark concentric target rings on older lower leaves with yellow halos.',
    symptoms: [
      'Concentric target-board rings on lower leaves',
      'Yellow chlorotic halos around lesions',
      'Stem cankers near the soil line',
    ],
    organicRemedy: 'Mulch soil surface to prevent spore splash; remove bottom 30cm of foliage; apply neem oil.',
  },
  {
    id: 'cassava-mosaic-disease',
    name: 'Cassava Mosaic',
    category: 'viral',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=300&q=80',
    description: 'Yellow-green mosaic mottling with curled, severely distorted leaves.',
    symptoms: [
      'Green and pale-yellow mosaic mottling',
      'Curled, twisted, distorted leaf lobes',
      'Severely stunted plant canopy and tubers',
    ],
    organicRemedy: 'Rogue and burn symptomatic plants immediately; plant certified virus-free stem cuttings.',
  },
  {
    id: 'fall-armyworm',
    name: 'Fall Armyworm',
    category: 'pests',
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=300&q=80',
    description: 'Ragged chewed leaf holes with sawdust-like frass inside the plant whorl.',
    symptoms: [
      'Ragged irregular holes on young whorl leaves',
      'Thick moist sawdust-like fecal frass in whorl',
      'Caterpillar with Y-shaped head mark',
    ],
    organicRemedy: 'Drop wood ash or coarse sand into whorl; apply Bacillus thuringiensis (Bt) in late afternoon.',
  },
  {
    id: 'aphids',
    name: 'Aphids',
    category: 'pests',
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=300&q=80',
    description: 'Clusters of sap-sucking insects under leaves producing sticky honeydew and black sooty mold.',
    symptoms: [
      'Dense colonies under tender new shoots',
      'Sticky shiny honeydew on foliage',
      'Black sooty mold growing on secretions',
    ],
    organicRemedy: 'Spray forceful water jet to dislodge colonies; apply 2% insecticidal soap spray or neem extract.',
  },
];

export function DiagnosisView({
  onOpenScan,
  onOpenHistory,
  onSelectProblem,
}: DiagnosisViewProps) {
  const [activeCategory, setActiveCategory] = useState<ProblemCategoryFilter>('fungal');
  const [selectedDetail, setSelectedDetail] = useState<typeof MOCKUP_PROBLEMS[0] | null>(null);

  const filterTabs: { id: ProblemCategoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'fungal', label: 'Fungal Diseases' },
    { id: 'viral', label: 'Viral Diseases' },
    { id: 'nematodes', label: 'Nematodes' },
    { id: 'pests', label: 'Pests' },
    { id: 'deficiencies', label: 'Deficiencies' },
  ];

  const displayedProblems = MOCKUP_PROBLEMS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header with Title & History Icon Button */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight">Diagnosis</h1>
        <button
          type="button"
          onClick={onOpenHistory}
          className="w-10 h-10 rounded-full bg-white border border-[#E6EBE4] text-[#19201D] flex items-center justify-center shadow-2xs hover:bg-[#F6F8F5] active:scale-95 transition-all touch-target"
          title="View Diagnosis History"
          aria-label="View Diagnosis History"
        >
          <History className="w-5 h-5 text-[#5E6D65]" />
        </button>
      </div>

      {/* Top Green Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#235338] text-white p-5 shadow-sm">
        <div className="max-w-[62%] space-y-2 relative z-10">
          <h2 className="text-base sm:text-lg font-extrabold leading-tight">
            Is your plant looking healthy?
          </h2>
          <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed">
            Scan or use images of your plant to identify issues.
          </p>

          <button
            type="button"
            onClick={onOpenScan}
            className="touch-target bg-white hover:bg-stone-100 text-[#235338] font-bold text-xs px-4 py-2.5 rounded-full shadow-xs active:scale-95 transition-all mt-2 min-h-[44px]"
          >
            Diagnose now
          </button>
        </div>

        {/* Potted Plant Graphic on Right */}
        <div className="absolute right-3 -bottom-2 w-32 h-36 flex items-end justify-center pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=260&q=80"
            alt="Healthy plant"
            className="w-28 h-32 object-contain drop-shadow-md rounded-2xl"
          />
        </div>
      </div>

      {/* Common Problems Section */}
      <div className="space-y-3 pt-2">
        <h3 className="font-extrabold text-sm text-[#19201D]">Common Problems</h3>

        {/* Scrollable Horizontal Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {filterTabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`touch-target px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 min-h-[38px] ${
                  isActive
                    ? 'bg-[#182635] text-white shadow-xs'
                    : 'bg-white text-[#5E6D65] border border-[#E6EBE4] hover:bg-[#F6F8F5]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cards List */}
        <div className="space-y-2.5">
          {displayedProblems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => {
                const match = KB_PROBLEMS.find((p) => p.id === problem.id);
                if (match && onSelectProblem) {
                  onSelectProblem(match);
                }
                setSelectedDetail(problem);
              }}
              className="bg-white rounded-2xl p-3.5 border border-[#E6EBE4] shadow-2xs hover:border-[#78C441]/50 hover:shadow-xs transition-all flex items-center gap-3.5 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                <img
                  src={problem.image}
                  alt={problem.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-xs sm:text-sm text-[#19201D] leading-tight truncate">
                  {problem.name}
                </h4>
                <p className="text-[11px] text-[#5E6D65] line-clamp-2 mt-1 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Problem Quick Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78C441] tracking-wider">
                  {selectedDetail.category} Problem
                </span>
                <h3 className="text-lg font-extrabold text-[#19201D]">{selectedDetail.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-black flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 border border-[#E6EBE4]">
              <img
                src={selectedDetail.image}
                alt={selectedDetail.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#19201D] mb-1">Key Symptoms:</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-[#5E6D65]">
                {selectedDetail.symptoms.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#D8F3DC]/40 p-3 rounded-2xl border border-[#B7E4C7]">
              <h4 className="text-xs font-bold text-[#1A3B29] flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#78C441]" />
                Organic Remedy / First-line Treatment:
              </h4>
              <p className="text-xs text-[#19201D] leading-relaxed">
                {selectedDetail.organicRemedy}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDetail(null);
                  onOpenScan();
                }}
                className="touch-target flex-1 bg-[#78C441] hover:bg-[#6BB536] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs min-h-[44px]"
              >
                Scan Plant For This Problem
              </button>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="touch-target px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
