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

export function GardenView() {
  const [plants, setPlants] = useState<Plant[]>([
    {
      id: 'plt-001',
      cropId: 'tomato',
      nickname: 'Roma Tomato Bed #1',
      location: 'bed',
      sunExposure: 'full',
      createdAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'plt-002',
      cropId: 'pepper',
      nickname: 'Scotch Bonnet Container Plot',
      location: 'container',
      sunExposure: 'partial',
      createdAt: '2026-10-05T09:30:00Z',
    },
  ]);

  const [history, setHistory] = useState<CachedDiagnosis[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCropId, setNewCropId] = useState('tomato');
  const [newNickname, setNewNickname] = useState('');
  const [newLocation, setNewLocation] = useState<PlantLocation>('bed');
  const [newSunExposure, setNewSunExposure] = useState<SunExposure>('full');

  useEffect(() => {
    // Load cached diagnosis history from Dexie
    db.history
      .orderBy('cachedAt')
      .reverse()
      .toArray()
      .then((items: CachedDiagnosis[]) => setHistory(items))
      .catch(() => {});
  }, []);

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Plant = {
      id: `plt-${Date.now()}`,
      cropId: newCropId,
      nickname: newNickname.trim() || `${newCropId.toUpperCase()} Field Plot`,
      location: newLocation,
      sunExposure: newSunExposure,
      createdAt: new Date().toISOString(),
    };
    setPlants((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewNickname('');
  };

  const handleDeletePlant = (id: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== id));
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

      {/* Plants Grid */}
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1B1B1B]">Crop Type</label>
                <select
                  value={newCropId}
                  onChange={(e) => setNewCropId(e.target.value)}
                  className="w-full text-xs font-bold bg-[#FAFAF5] border border-[#E5E5DC] rounded-xl p-3"
                >
                  {KB_CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {CROP_ICONS[c.id] || '🌱'} {c.name.en}
                    </option>
                  ))}
                </select>
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
