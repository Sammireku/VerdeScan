// T-020: My Garden - Plants CRUD & Diagnosis History (Verdant Earth Palette)
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Sprout,
  Calendar,
  MapPin,
  Sun,
  History,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FolderHeart,
  Layers,
} from 'lucide-react';
import { KB_CROPS } from '@verdescan/kb';
import { db, type CachedDiagnosis } from '../../lib/db';
import type { Plant, PlantLocation, SunExposure } from '@verdescan/shared';

const CROP_ICONS: Record<string, string> = {
  tomato: '🍅',
  pepper: '🌶️',
  maize: '🌽',
  cassava: '🥔',
  cabbage: '🥬',
  okra: '🥢',
  onion: '🧅',
  plantain: '🍌',
};

import {
  getGardenPlants,
  addGardenPlant,
  deleteGardenPlant,
  saveCustomCrop,
  getCropIcon,
  getCustomCrops,
  subscribeGarden,
} from '../../lib/garden';

export function GardenView() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [history, setHistory] = useState<CachedDiagnosis[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCustomCropMode, setIsCustomCropMode] = useState(false);
  const [newCropId, setNewCropId] = useState('tomato');
  const [customCropName, setCustomCropName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newLocation, setNewLocation] = useState<PlantLocation>('bed');
  const [newSunExposure, setNewSunExposure] = useState<SunExposure>('full');

  const reloadPlants = async () => {
    const list = await getGardenPlants();
    setPlants(list);
  };

  useEffect(() => {
    reloadPlants();
    const unsub = subscribeGarden(reloadPlants);

    // Load cached diagnosis history from Dexie
    db.history
      .orderBy('cachedAt')
      .reverse()
      .toArray()
      .then((items: CachedDiagnosis[]) => setHistory(items))
      .catch(() => {});

    return () => unsub();
  }, []);

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalCropId = newCropId;
    let finalCropLabel = newCropId;

    if (isCustomCropMode && customCropName.trim()) {
      const saved = saveCustomCrop(customCropName.trim());
      finalCropId = saved.id;
      finalCropLabel = saved.name;
    }

    const created: Plant = {
      id: `plt-${Date.now()}`,
      cropId: finalCropId,
      nickname: newNickname.trim() || `${finalCropLabel.charAt(0).toUpperCase() + finalCropLabel.slice(1)} Field Plot`,
      location: newLocation,
      sunExposure: newSunExposure,
      createdAt: new Date().toISOString(),
    };

    await addGardenPlant(created);
    setShowAddModal(false);
    setNewNickname('');
    setCustomCropName('');
    setIsCustomCropMode(false);
  };

  const handleDeletePlant = async (id: string) => {
    await deleteGardenPlant(id);
  };

  return (
    <div className="space-y-6">
      {/* Garden Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B1B1B] tracking-tight">My Farm & Crops</h1>
          <p className="text-xs text-[#5A6B5E]">Track crop plots, soil methods, and previous AI diagnosis records.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> Add Crop Plot
        </button>
      </div>

      {/* Plants Grid or Empty State */}
      {plants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#B7E4C7] p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center mx-auto text-2xl font-bold shadow-2xs">
            🌱
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1B1B1B]">No Crop Plots Added Yet</h3>
            <p className="text-xs text-[#5A6B5E] max-w-md mx-auto mt-1 leading-relaxed">
              Add the crops you grow on your farm (e.g. Tomatoes, Cassava, Cocoa, Yam). Once added, only your garden crops will appear in the crop selector on the Scan screen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="touch-target inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-xs min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add Your First Crop Plot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((plant) => {
          const cropInfo = KB_CROPS.find((c) => c.id === plant.cropId);
          const icon = CROP_ICONS[plant.cropId] || '🌱';
          return (
            <div
              key={plant.id}
              className="bg-white rounded-2xl border border-[#E5E5DC] p-5 shadow-xs space-y-4 hover:border-[#2D6A4F]/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D8F3DC] text-2xl flex items-center justify-center font-bold shadow-2xs">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#1B1B1B]">{plant.nickname}</h3>
                    <p className="text-xs text-[#5A6B5E] font-medium">{cropInfo?.name.en || plant.cropId}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePlant(plant.id)}
                  className="text-stone-400 hover:text-[#BC4749] p-1.5 transition-colors"
                  title="Remove crop plot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#1B1B1B] bg-[#FAFAF5] p-3 rounded-xl border border-[#E5E5DC]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span className="capitalize">{plant.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#E09F3E]" />
                  <span className="capitalize">{plant.sunExposure || 'full'} Sun</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5A6B5E] pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Added {new Date(plant.createdAt as string).toLocaleDateString()}
                </span>
                <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Monitoring
                </span>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Diagnosis History Timeline */}
      <div className="bg-white rounded-2xl border border-[#E5E5DC] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-[#2D6A4F]" />
            <h2 className="font-bold text-sm text-[#1B1B1B]">Offline Scan History (Dexie IndexedDB)</h2>
          </div>
          <span className="text-xs text-[#5A6B5E] font-medium">{history.length} records saved locally</span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E5E5DC] bg-[#FAFAF5] flex items-center justify-between flex-wrap gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1B1B1B]">
                      {item.topProblemId || 'Crop Diagnosis'}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'complete'
                          ? 'bg-[#D8F3DC] text-[#2D6A4F]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6B5E]">
                    Crop: <strong className="text-[#1B1B1B] capitalize">{item.context.cropId || 'General'}</strong> ·{' '}
                    {new Date(item.cachedAt).toLocaleString()}
                  </p>
                </div>
                {item.candidates[0] && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#2D6A4F]">
                      {Math.round(item.candidates[0].confidence * 100)}% Certainty
                    </span>
                    <p className="text-[11px] text-[#5A6B5E]">{item.treatmentIds.length} vetted treatments</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#5A6B5E] space-y-1">
            <p>No past scans recorded yet.</p>
            <p>Run a diagnosis under the Scan tab to build your local plant health history.</p>
          </div>
        )}
      </div>

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E5E5DC]">
            <h3 className="font-bold text-base text-[#1B1B1B]">Add Crop Plot to Garden</h3>
            <form onSubmit={handleAddPlant} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B1B1B]">Crop Type</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCropMode(!isCustomCropMode)}
                    className="text-xs font-bold text-[#2D6A4F] hover:underline"
                  >
                    {isCustomCropMode ? '← Pick from list' : '+ Enter custom crop'}
                  </button>
                </div>

                {!isCustomCropMode ? (
                  <select
                    value={newCropId}
                    onChange={(e) => setNewCropId(e.target.value)}
                    className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  >
                    {KB_CROPS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getCropIcon(c.id)} {c.name.en}
                      </option>
                    ))}
                    {getCustomCrops().map((c) => (
                      <option key={c.id} value={c.id}>
                        {getCropIcon(c.id)} {c.name} (Custom)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter any crop (e.g. Cocoa, Yam, Sorghum, Passion Fruit...)"
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                    className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#2D6A4F] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1B1B1B]">Plot Name or Location</label>
                <input
                  type="text"
                  placeholder="e.g. Raised Bed East / Plot A"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full text-xs font-medium bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1B1B1B]">Planting Method</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as PlantLocation)}
                    className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3"
                  >
                    <option value="bed">Raised Bed</option>
                    <option value="container">Recycled Container</option>
                    <option value="field">Open Field</option>
                    <option value="indoor">Indoor Nursery</option>
                    <option value="greenhouse">Greenhouse</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1B1B1B]">Sunlight</label>
                  <select
                    value={newSunExposure}
                    onChange={(e) => setNewSunExposure(e.target.value as SunExposure)}
                    className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3"
                  >
                    <option value="full">Full Sun</option>
                    <option value="partial">Partial Sun</option>
                    <option value="shade">Shade</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#5A6B5E] hover:bg-[#F2F2EC] rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl shadow-xs min-h-[44px]"
                >
                  Save Crop Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
