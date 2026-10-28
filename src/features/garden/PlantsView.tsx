// Screen 3: My Plants & Garden Plots Management with Distinct Add Plant and Add Room / Plot Forms
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Trash2,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  Tag,
  Package,
  Layers,
  MapPin,
  Home,
  Sun,
  Droplets,
  Sprout,
  Grid,
} from 'lucide-react';
import {
  getGardenPlants,
  addGardenPlant,
  deleteGardenPlant,
  getGardenPlots,
  addGardenPlot,
  deleteGardenPlot,
  subscribeGarden,
  saveCustomCrop,
  type GardenPlot,
} from '../../lib/garden';
import type { Plant } from '@verdescan/shared';

export interface PlantsViewProps {
  onOpenScan?: () => void;
}

interface PlantReminder {
  id: string;
  plantName: string;
  type: 'water' | 'fertilize' | 'inspect' | 'repot';
  frequency: string;
  dueDate: string;
  completed: boolean;
}

const SAMPLE_PLANTS: (Partial<Plant> & { image: string; variety: string })[] = [
  {
    id: 'sample-snake-plant',
    cropId: 'snake-plant',
    nickname: 'Snake Plant',
    variety: 'Sansevieria trifasciata',
    cropVariety: 'Laurentii Variegated',
    plantingDate: '2025-01-24',
    source: 'Nursery Seedling Transplant',
    environment: 'Indoor / Windowsill',
    location: 'indoor',
    sunExposure: 'partial',
    createdAt: '2025-01-24T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sample-zz-plant',
    cropId: 'zz-plant',
    nickname: 'ZZ Plant',
    variety: 'Zamioculcas zamiifolia',
    cropVariety: 'Raven Black Leaf',
    plantingDate: '2025-01-24',
    source: 'Stem Cutting / Vegetative',
    environment: 'Indoor / Windowsill',
    location: 'indoor',
    sunExposure: 'shade',
    createdAt: '2025-01-24T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1632490518543-9828236df7a3?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sample-spider-plant',
    cropId: 'spider-plant',
    nickname: 'Spider Plant',
    variety: 'Chlorophytum comosum',
    cropVariety: 'Vittatum Striped',
    plantingDate: '2025-01-24',
    source: 'Packaged Certified Seeds',
    environment: 'Container / Pot',
    location: 'container',
    sunExposure: 'partial',
    createdAt: '2025-01-24T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sample-peace-lily',
    cropId: 'peace-lily',
    nickname: 'Peace Lily',
    variety: 'Spathiphyllum spp',
    cropVariety: 'Mauna Loa Supreme',
    plantingDate: '2025-01-24',
    source: 'Saved from Fruit',
    environment: 'Container / Pot',
    location: 'indoor',
    sunExposure: 'shade',
    createdAt: '2025-01-24T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=300&q=80',
  },
];

const SOURCE_OPTIONS = [
  'Packaged Certified Seeds',
  'Saved from Fruit',
  'Nursery Seedling Transplant',
  'Stem Cutting / Vegetative',
  'Bulb / Rhizome / Tuber',
  'Local Farmer Exchange',
];

const ENVIRONMENT_OPTIONS = [
  'Container / Pot',
  'Raised Bed',
  'Open Field',
  'Greenhouse / Polytunnel',
  'Indoor / Windowsill',
];

export function PlantsView({ onOpenScan }: PlantsViewProps) {
  const [activeTab, setActiveTab] = useState<'plants' | 'plots' | 'reminder'>('plants');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plots, setPlots] = useState<GardenPlot[]>([]);

  // Distinct modal visibility states for Plant vs Room/Plot
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Reminders list
  const [reminders, setReminders] = useState<PlantReminder[]>([
    {
      id: 'rem-1',
      plantName: 'Snake Plant',
      type: 'water',
      frequency: 'Every 14 days',
      dueDate: 'Tomorrow',
      completed: false,
    },
    {
      id: 'rem-2',
      plantName: 'Peace Lily',
      type: 'inspect',
      frequency: 'Every 3 days',
      dueDate: 'Today at 5:00 PM',
      completed: false,
    },
  ]);

  // Form states for adding PLANT
  const [newPlantName, setNewPlantName] = useState('');
  const [newCropType, setNewCropType] = useState('tomato');
  const [newCropVariety, setNewCropVariety] = useState('');
  const [newPlantingDate, setNewPlantingDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [newSource, setNewSource] = useState(SOURCE_OPTIONS[0]);
  const [newEnvironment, setNewEnvironment] = useState(ENVIRONMENT_OPTIONS[0]);
  const [assignedPlotId, setAssignedPlotId] = useState('');

  // Form states for adding ROOM / PLOT (Distinct dedicated form)
  const [plotName, setPlotName] = useState('');
  const [plotType, setPlotType] = useState<GardenPlot['type']>('raised_bed');
  const [plotSunlight, setPlotSunlight] = useState<GardenPlot['sunlight']>('full');
  const [plotSoil, setPlotSoil] = useState('Loam + Aged Organic Compost');
  const [plotDimensions, setPlotDimensions] = useState('4ft x 8ft Raised Bed');
  const [plotNotes, setPlotNotes] = useState('');

  // Form states for reminder
  const [reminderPlant, setReminderPlant] = useState('');
  const [reminderType, setReminderType] = useState<'water' | 'fertilize' | 'inspect' | 'repot'>('water');
  const [reminderFreq, setReminderFreq] = useState('Weekly');

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeGarden(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const loadData = async () => {
    const pList = await getGardenPlants();
    setPlants(pList);
    setPlots(getGardenPlots());
  };

  const handleSeedSamples = async () => {
    for (const p of SAMPLE_PLANTS) {
      saveCustomCrop(p.nickname || p.cropId || 'Plant');
      await addGardenPlant(p as unknown as Plant);
    }
  };

  // Submit Handler: Add Plant
  const handleAddPlantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;

    const cropId = (newCropType || newPlantName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    saveCustomCrop(newPlantName.trim());

    // Map selected environment to valid PlantLocation
    let mappedLocation: 'bed' | 'container' | 'field' | 'indoor' | 'greenhouse' = 'container';
    if (newEnvironment.toLowerCase().includes('bed')) mappedLocation = 'bed';
    else if (newEnvironment.toLowerCase().includes('field')) mappedLocation = 'field';
    else if (newEnvironment.toLowerCase().includes('greenhouse')) mappedLocation = 'greenhouse';
    else if (newEnvironment.toLowerCase().includes('indoor')) mappedLocation = 'indoor';

    const newPlant: Plant = {
      id: `plant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cropId,
      nickname: newPlantName.trim(),
      cropVariety: newCropVariety.trim() || undefined,
      plantingDate: newPlantingDate || undefined,
      source: newSource,
      environment: assignedPlotId
        ? plots.find((pl) => pl.id === assignedPlotId)?.name || newEnvironment
        : newEnvironment,
      location: mappedLocation,
      sunExposure: 'full',
      createdAt: new Date().toISOString(),
    };

    await addGardenPlant(newPlant);
    setNewPlantName('');
    setNewCropVariety('');
    setNewPlantingDate(new Date().toISOString().split('T')[0]);
    setIsAddPlantModalOpen(false);
  };

  // Submit Handler: Add Room / Plot (Distinct dedicated action)
  const handleAddPlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim()) return;

    const newPlot: GardenPlot = {
      id: `plot-${Date.now()}`,
      name: plotName.trim(),
      type: plotType,
      sunlight: plotSunlight,
      soilType: plotSoil.trim() || 'Organic Loam Blend',
      dimensions: plotDimensions.trim() || 'Standard Bed',
      notes: plotNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addGardenPlot(newPlot);
    setPlots(getGardenPlots());
    setPlotName('');
    setPlotNotes('');
    setIsAddPlotModalOpen(false);
  };

  const handleDeletePlot = (id: string) => {
    deleteGardenPlot(id);
    setPlots(getGardenPlots());
  };

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRem: PlantReminder = {
      id: `rem-${Date.now()}`,
      plantName: reminderPlant || (plants[0]?.nickname ?? 'My Plant'),
      type: reminderType,
      frequency: reminderFreq,
      dueDate: 'In 3 days',
      completed: false,
    };
    setReminders((prev) => [...prev, newRem]);
    setIsReminderModalOpen(false);
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeletePlant = async (id: string) => {
    await deleteGardenPlant(id);
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Screen Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight">Garden & Plants</h1>
          <p className="text-[11px] text-[#5E6D65] font-medium">Manage crops, beds, rooms & care</p>
        </div>
        {plants.length === 0 && (
          <button
            type="button"
            onClick={handleSeedSamples}
            className="text-[11px] font-bold text-[#78C441] bg-[#D8F3DC]/60 hover:bg-[#D8F3DC] px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Samples</span>
          </button>
        )}
      </div>

      {/* Segmented Control Pill: [ My plants ] | [ Rooms & Plots ] | [ Reminder ] */}
      <div className="bg-[#EBF0E9] p-1 rounded-2xl flex items-center max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('plants')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all touch-target min-h-[38px] ${
            activeTab === 'plants'
              ? 'bg-[#182635] text-white shadow-xs'
              : 'text-[#5E6D65] hover:text-[#19201D]'
          }`}
        >
          My plants ({plants.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('plots')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all touch-target min-h-[38px] ${
            activeTab === 'plots'
              ? 'bg-[#182635] text-white shadow-xs'
              : 'text-[#5E6D65] hover:text-[#19201D]'
          }`}
        >
          Rooms & Plots ({plots.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reminder')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all touch-target min-h-[38px] ${
            activeTab === 'reminder'
              ? 'bg-[#182635] text-white shadow-xs'
              : 'text-[#5E6D65] hover:text-[#19201D]'
          }`}
        >
          Reminders
        </button>
      </div>

      {/* TAB 1: MY PLANTS */}
      {activeTab === 'plants' && (
        <div className="space-y-4">
          {plants.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-[#E6EBE4] p-8 text-center space-y-6 shadow-xs my-4">
              <div className="relative w-36 h-40 mx-auto flex items-end justify-center">
                <svg viewBox="0 0 120 140" className="w-32 h-36">
                  <path d="M60 70 Q40 30 20 20 Q50 30 55 70" fill="#78C441" stroke="#5EA832" strokeWidth="1.5" />
                  <path d="M60 70 Q80 30 100 20 Q70 30 65 70" fill="#78C441" stroke="#5EA832" strokeWidth="1.5" />
                  <path d="M60 70 Q60 10 60 5 Q65 30 60 70" fill="#A3D995" stroke="#5EA832" strokeWidth="1.5" />
                  <rect x="40" y="70" width="40" height="35" rx="8" fill="#88C057" />
                  <rect x="38" y="68" width="44" height="6" rx="3" fill="#A3D995" />
                  <line x1="42" y1="105" x2="35" y2="135" stroke="#78716C" strokeWidth="3" />
                  <line x1="78" y1="105" x2="85" y2="135" stroke="#78716C" strokeWidth="3" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#19201D]">No plants in the garden</h3>
                <p className="text-xs text-[#5E6D65]">Add plants or set up your growing rooms/plots</p>
              </div>

              <div className="space-y-2.5 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setIsAddPlantModalOpen(true)}
                  className="touch-target w-full bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add plant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddPlotModalOpen(true)}
                  className="touch-target w-full bg-white hover:bg-stone-50 border border-[#E6EBE4] text-[#19201D] font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <Home className="w-4 h-4 text-[#5E6D65]" />
                  <span>+ Add room / plot</span>
                </button>
              </div>
            </div>
          ) : (
            /* Populated Plants Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5E6D65]">
                  {plants.length} plant{plants.length > 1 ? 's' : ''} in monitoring
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPlotModalOpen(true)}
                    className="touch-target text-xs font-bold text-[#1D4ED8] bg-[#EBF5FF] hover:bg-[#dbeafe] px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 min-h-[36px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Plot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddPlantModalOpen(true)}
                    className="touch-target text-xs font-bold text-[#78C441] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 min-h-[36px]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add plant</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plants.map((plant) => {
                  const sampleMatch = SAMPLE_PLANTS.find(
                    (s) => s.id === plant.id || s.nickname?.toLowerCase() === plant.nickname?.toLowerCase()
                  );
                  const plantImg =
                    sampleMatch?.image ||
                    'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80';
                  const dateStr = plant.plantingDate
                    ? plant.plantingDate
                    : plant.createdAt
                    ? new Date(plant.createdAt as string).toLocaleDateString('en-GB')
                    : '2025-01-24';

                  const varietyDisplay = plant.cropVariety || sampleMatch?.cropVariety || plant.cropId.replace(/-/g, ' ');
                  const sourceDisplay = plant.source || sampleMatch?.source || 'Packaged Seeds';
                  const environmentDisplay = plant.environment || sampleMatch?.environment || 'Container / Pot';

                  return (
                    <div
                      key={plant.id}
                      className="bg-white rounded-2xl p-3.5 border border-[#E6EBE4] shadow-2xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                          <img
                            src={plantImg}
                            alt={plant.nickname || 'Plant'}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeletePlant(plant.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#BC4749] text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all touch-target"
                            title="Remove plant"
                            aria-label="Remove plant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#78C441]" />
                            <span>{environmentDisplay}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-[#19201D] leading-tight">
                            {plant.nickname || 'Unnamed Plant'}
                          </h4>

                          <div className="flex items-center gap-1 text-[11px] text-[#5E6D65] font-semibold">
                            <Tag className="w-3 h-3 text-[#78C441] shrink-0" />
                            <span className="truncate">Variety: {varietyDisplay}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-[#8C9B90]">
                            <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>Planted: {dateStr}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-[#2D6A4F] bg-[#D8F3DC]/60 px-2 py-0.5 rounded-lg w-fit mt-1">
                            <Package className="w-3 h-3 text-[#2D6A4F]" />
                            <span className="truncate">{sourceDisplay}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onOpenScan}
                        className="touch-target w-full bg-[#78C441] hover:bg-[#6BB536] text-white font-bold text-[11px] py-2 rounded-xl transition-all shadow-2xs min-h-[38px] flex items-center justify-center gap-1"
                      >
                        <span>Scan & Inspect</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROOMS & PLOTS (Dedicated room & garden space management) */}
      {activeTab === 'plots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#5E6D65]">
                {plots.length} Growing Space{plots.length > 1 ? 's' : ''} Configured
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddPlotModalOpen(true)}
              className="touch-target text-xs font-bold text-[#78C441] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Add Room / Plot</span>
            </button>
          </div>

          <div className="space-y-3">
            {plots.map((plot) => {
              // Count plants allocated to this plot
              const assignedPlants = plants.filter(
                (p) =>
                  (p.environment && p.environment.toLowerCase().includes(plot.name.toLowerCase())) ||
                  p.location === plot.type.split('_')[0]
              );

              return (
                <div
                  key={plot.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-[#19201D] leading-tight">
                          {plot.name}
                        </h3>
                        <p className="text-[11px] text-[#5E6D65] capitalize mt-0.5">
                          {plot.type.replace('_', ' ')} • {plot.dimensions || 'Standard Area'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePlot(plot.id)}
                      className="text-stone-300 hover:text-[#BC4749] p-1.5 touch-target"
                      title="Delete plot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#F6F8F5] p-2.5 rounded-xl space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-[#5E6D65] font-bold">
                        <Sun className="w-3 h-3 text-[#E09F3E]" />
                        <span>Sunlight</span>
                      </div>
                      <p className="font-bold text-[#19201D] capitalize">{plot.sunlight} Sun</p>
                    </div>

                    <div className="bg-[#F6F8F5] p-2.5 rounded-xl space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-[#5E6D65] font-bold">
                        <Droplets className="w-3 h-3 text-[#3B82F6]" />
                        <span>Soil Medium</span>
                      </div>
                      <p className="font-bold text-[#19201D] truncate">{plot.soilType || 'Loam blend'}</p>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {plot.notes && (
                    <p className="text-[11px] text-[#5E6D65] bg-stone-50 p-2.5 rounded-xl leading-relaxed">
                      💡 {plot.notes}
                    </p>
                  )}

                  {/* Allocated Plants & Quick Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E6EBE4] text-xs">
                    <span className="text-[11px] text-[#5E6D65] font-semibold">
                      {assignedPlants.length} active crops in this plot
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAssignedPlotId(plot.id);
                        setNewEnvironment(plot.name);
                        setIsAddPlantModalOpen(true);
                      }}
                      className="text-[#78C441] hover:text-[#6BB536] font-extrabold flex items-center gap-1 text-[11px] touch-target"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Plant Here</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REMINDERS */}
      {activeTab === 'reminder' && (
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E6EBE4] p-8 text-center space-y-6 shadow-xs my-4">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-32 h-32">
                  <rect x="25" y="25" width="70" height="70" rx="14" fill="#E8F5E9" />
                  <rect x="25" y="25" width="70" height="22" rx="10" fill="#88C057" />
                  <line x1="40" y1="18" x2="40" y2="30" stroke="#1A3B29" strokeWidth="4" strokeLinecap="round" />
                  <line x1="80" y1="18" x2="80" y2="30" stroke="#1A3B29" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="60" cy="70" r="14" fill="#78C441" opacity="0.3" />
                  <path d="M55 70 L59 74 L67 66" stroke="#1A3B29" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#19201D]">No reminders yet</h3>
                <p className="text-xs text-[#5E6D65]">Set watering, feeding, and spray schedules</p>
              </div>

              <button
                type="button"
                onClick={() => setIsReminderModalOpen(true)}
                className="touch-target w-full max-w-xs mx-auto bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Reminder</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5E6D65]">Active Schedules</span>
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(true)}
                  className="touch-target text-xs font-bold text-[#78C441] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Reminder</span>
                </button>
              </div>

              <div className="space-y-2">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="bg-white rounded-2xl p-4 border border-[#E6EBE4] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleReminder(rem.id)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                          rem.completed
                            ? 'bg-[#78C441] border-[#78C441] text-white'
                            : 'border-stone-300 hover:border-[#78C441]'
                        }`}
                      >
                        {rem.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <h4
                          className={`text-xs sm:text-sm font-extrabold text-[#19201D] leading-tight ${
                            rem.completed ? 'line-through text-stone-400' : ''
                          }`}
                        >
                          {rem.type === 'water' && '💧 Water '}
                          {rem.type === 'inspect' && '🔍 Inspect '}
                          {rem.type === 'fertilize' && '🌿 Fertilize '}
                          {rem.type === 'repot' && '🪴 Repot '}
                          {rem.plantName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#5E6D65] mt-0.5">
                          <span>{rem.frequency}</span>
                          <span>•</span>
                          <span className="text-[#E09F3E] font-medium flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {rem.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReminders((prev) => prev.filter((r) => r.id !== rem.id))
                      }
                      className="text-stone-300 hover:text-[#BC4749] p-1.5 touch-target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD PLANT (Dedicated for individual plants/crops) */}
      {isAddPlantModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddPlantModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddPlantSubmit}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-[#E6EBE4] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#19201D]">Add Plant to Garden</h3>
                <p className="text-[11px] text-[#5E6D65]">Record crop variety, planting date & seed source</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlantModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Field: Plant Nickname */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D] flex items-center gap-1">
                <span>Plant Name / Nickname</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                placeholder="e.g. Tomato Plot 1, Snake Plant, Scotch Bonnet..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Field: Crop Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Crop Type / Species</label>
              <input
                type="text"
                value={newCropType}
                onChange={(e) => setNewCropType(e.target.value)}
                placeholder="e.g. Tomato, Maize, Pepper, Cassava..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Field: Crop Variety */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#78C441]" />
                <span>Crop Variety Name</span>
              </label>
              <input
                type="text"
                value={newCropVariety}
                onChange={(e) => setNewCropVariety(e.target.value)}
                placeholder="e.g. Roma VF, Sugar Baby, Laurentii..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Field: Planting Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#78C441]" />
                <span>Planting Date</span>
              </label>
              <input
                type="date"
                required
                value={newPlantingDate}
                onChange={(e) => setNewPlantingDate(e.target.value)}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Field: Source */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#78C441]" />
                <span>Source (packaged seeds, from fruit etc)</span>
              </label>
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Field: Assign to Room / Plot */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D] flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#78C441]" />
                <span>Assign to Room / Plot</span>
              </label>
              <select
                value={assignedPlotId}
                onChange={(e) => setAssignedPlotId(e.target.value)}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              >
                <option value="">General Garden Area</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    🏡 {p.name} ({p.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="touch-target flex-1 bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-xs min-h-[44px]"
              >
                Save Plant
              </button>
              <button
                type="button"
                onClick={() => setIsAddPlantModalOpen(false)}
                className="touch-target px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD ROOM / PLOT (Distinct dedicated form tailored for garden spaces) */}
      {isAddPlotModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddPlotModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddPlotSubmit}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-3 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-[#E6EBE4] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBF5FF] text-[#2563EB] flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#19201D]">Add Room or Farm Plot</h3>
                  <p className="text-[11px] text-[#5E6D65]">Define growing beds, greenhouses, or indoor rooms</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Plot / Room Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D] flex items-center gap-1">
                <span>Room / Plot Name</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                placeholder="e.g. North Raised Bed, Backyard Greenhouse, Living Room Window..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Growing Space Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Space / Environment Type</label>
              <select
                value={plotType}
                onChange={(e) => setPlotType(e.target.value as GardenPlot['type'])}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              >
                <option value="raised_bed">🌱 Raised Garden Bed</option>
                <option value="greenhouse">🏡 Greenhouse / Polytunnel</option>
                <option value="indoor_room">🪴 Indoor Room / Windowsill</option>
                <option value="container_terrace">🪴 Balcony / Container Terrace</option>
                <option value="open_field">🌾 Open Agricultural Field</option>
              </select>
            </div>

            {/* Sunlight Exposure */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Sunlight Exposure</label>
              <select
                value={plotSunlight}
                onChange={(e) => setPlotSunlight(e.target.value as GardenPlot['sunlight'])}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              >
                <option value="full">☀️ Full Sun (6+ hours direct)</option>
                <option value="partial">⛅ Partial Sun / Dappled Light</option>
                <option value="shade">☁️ Full Shade / Low Indirect Light</option>
              </select>
            </div>

            {/* Soil / Medium */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Soil / Growing Medium Blend</label>
              <input
                type="text"
                value={plotSoil}
                onChange={(e) => setPlotSoil(e.target.value)}
                placeholder="e.g. 50% Topsoil + 30% Aged Compost + 20% Perlite..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Dimensions / Capacity */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Dimensions or Pot Capacity</label>
              <input
                type="text"
                value={plotDimensions}
                onChange={(e) => setPlotDimensions(e.target.value)}
                placeholder="e.g. 4ft x 8ft Bed, 8 Large Containers, 0.25 Acre..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Microclimate & Irrigation Notes</label>
              <input
                type="text"
                value={plotNotes}
                onChange={(e) => setPlotNotes(e.target.value)}
                placeholder="e.g. Automated drip tape installed, protected from harsh north winds..."
                className="w-full text-xs bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-[#78C441] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="touch-target flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-xs min-h-[44px]"
              >
                Create Room / Plot
              </button>
              <button
                type="button"
                onClick={() => setIsAddPlotModalOpen(false)}
                className="touch-target px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ADD REMINDER */}
      {isReminderModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsReminderModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddReminderSubmit}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#19201D]">Add Care Reminder</h3>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-black flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Select Plant</label>
              <select
                value={reminderPlant}
                onChange={(e) => setReminderPlant(e.target.value)}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px]"
              >
                {plants.length > 0 ? (
                  plants.map((p) => (
                    <option key={p.id} value={p.nickname}>
                      {p.nickname}
                    </option>
                  ))
                ) : (
                  <option value="Snake Plant">Snake Plant</option>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Action Type</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as typeof reminderType)}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px]"
              >
                <option value="water">💧 Watering</option>
                <option value="inspect">🔍 Disease Inspection</option>
                <option value="fertilize">🌿 Organic Fertilizer / Compost</option>
                <option value="repot">🪴 Repotting</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5E6D65]">Frequency</label>
              <select
                value={reminderFreq}
                onChange={(e) => setReminderFreq(e.target.value)}
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 min-h-[44px]"
              >
                <option value="Daily">Daily</option>
                <option value="Every 3 days">Every 3 days</option>
                <option value="Weekly">Weekly</option>
                <option value="Every 14 days">Every 14 days</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="touch-target flex-1 bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-xs min-h-[44px]"
              >
                Set Reminder
              </button>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="touch-target px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
