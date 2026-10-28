// Garden and Crops Store with Dexie persistence and real-time subscription
import { db } from './db';
import type { Plant } from '@verdescan/shared';
import { KB_CROPS } from '@verdescan/kb';

const CUSTOM_CROPS_KEY = 'verdescan_custom_crops';
const GARDEN_UPDATED_EVENT = 'verdescan-garden-updated';

export const DEFAULT_CROP_ICONS: Record<string, string> = {
  tomato: '🍅',
  pepper: '🌶️',
  maize: '🌽',
  cassava: '🥔',
  cabbage: '🥬',
  okra: '🥢',
  onion: '🧅',
  plantain: '🍌',
  potato: '🥔',
  eggplant: '🍆',
  carrot: '🥕',
  yam: '🍠',
  cocoa: '🍫',
  sorghum: '🌾',
  rice: '🍚',
  beans: '🫘',
  cowpea: '🫘',
  mango: '🥭',
  banana: '🍌',
  citrus: '🍋',
  general: '🌱',
};

export function getCropIcon(cropId: string): string {
  const normalized = cropId.toLowerCase().trim();
  for (const [key, icon] of Object.entries(DEFAULT_CROP_ICONS)) {
    if (normalized.includes(key)) return icon;
  }
  return '🌱';
}

export function getCustomCrops(): { id: string; name: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CROPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomCrop(name: string): { id: string; name: string } {
  const trimmed = name.trim();
  const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (typeof window === 'undefined') return { id, name: trimmed };

  const existing = getCustomCrops();
  const found = existing.find((c) => c.id === id || c.name.toLowerCase() === trimmed.toLowerCase());
  if (found) return found;

  const updated = [...existing, { id, name: trimmed }];
  localStorage.setItem(CUSTOM_CROPS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(GARDEN_UPDATED_EVENT));
  return { id, name: trimmed };
}

export interface GardenPlot {
  id: string;
  name: string;
  type: 'raised_bed' | 'container_terrace' | 'greenhouse' | 'indoor_room' | 'open_field';
  sunlight: 'full' | 'partial' | 'shade';
  soilType?: string;
  dimensions?: string;
  notes?: string;
  createdAt: string;
}

const GARDEN_PLOTS_KEY = 'verdescan_garden_plots';

export function getGardenPlots(): GardenPlot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GARDEN_PLOTS_KEY);
    if (raw) return JSON.parse(raw);
    // Default initial starter plots
    const defaultPlots: GardenPlot[] = [
      {
        id: 'plot-raised-bed-1',
        name: 'South Sunny Raised Bed',
        type: 'raised_bed',
        sunlight: 'full',
        soilType: 'Loam + Rich Compost',
        dimensions: '4ft x 12ft',
        notes: 'Equipped with drip tape; receives 7 hours of direct tropical light.',
        createdAt: '2025-01-20T10:00:00Z',
      },
      {
        id: 'plot-greenhouse-1',
        name: 'Backyard Nursery Polytunnel',
        type: 'greenhouse',
        sunlight: 'partial',
        soilType: 'Sterilized Seedling Mix & Perlite',
        dimensions: '8ft x 10ft',
        notes: 'High humidity enclosure for propagation and seedling hardening.',
        createdAt: '2025-01-22T10:00:00Z',
      },
    ];
    localStorage.setItem(GARDEN_PLOTS_KEY, JSON.stringify(defaultPlots));
    return defaultPlots;
  } catch {
    return [];
  }
}

export function addGardenPlot(plot: GardenPlot): void {
  const current = getGardenPlots();
  const updated = [plot, ...current.filter((p) => p.id !== plot.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(GARDEN_PLOTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(GARDEN_UPDATED_EVENT));
  }
}

export function deleteGardenPlot(id: string): void {
  const current = getGardenPlots();
  const updated = current.filter((p) => p.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(GARDEN_PLOTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(GARDEN_UPDATED_EVENT));
  }
}

export async function getGardenPlants(): Promise<Plant[]> {
  try {
    const all = await db.plants.toArray();
    return all;
  } catch {
    return [];
  }
}

export async function addGardenPlant(plant: Plant): Promise<void> {
  await db.plants.put(plant);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GARDEN_UPDATED_EVENT));
  }
}

export async function deleteGardenPlant(id: string): Promise<void> {
  await db.plants.delete(id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GARDEN_UPDATED_EVENT));
  }
}

export function subscribeGarden(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(GARDEN_UPDATED_EVENT, callback);
  return () => window.removeEventListener(GARDEN_UPDATED_EVENT, callback);
}

export interface AvailableCrop {
  id: string;
  name: string;
  icon: string;
  isFromGarden?: boolean;
  isCustom?: boolean;
}

/**
 * Derives the crops available for inspection:
 * - If user has added crops to "My Garden", show those crops from the garden.
 * - If NO crops are in the garden yet, show the default priority crops.
 * - Plus include any custom crops added by the user.
 */
export async function getAvailableInspectionCrops(): Promise<AvailableCrop[]> {
  const gardenPlants = await getGardenPlants();
  const customCrops = getCustomCrops();
  const result: AvailableCrop[] = [];
  const seenIds = new Set<string>();

  if (gardenPlants.length > 0) {
    // Only move crops added to my garden to select crop being inspected
    for (const plant of gardenPlants) {
      if (!seenIds.has(plant.cropId)) {
        seenIds.add(plant.cropId);
        const kbMatch = KB_CROPS.find((c) => c.id === plant.cropId);
        const customMatch = customCrops.find((c) => c.id === plant.cropId);
        const name = kbMatch?.name.en || customMatch?.name || plant.cropId.replace(/-/g, ' ');
        result.push({
          id: plant.cropId,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          icon: getCropIcon(plant.cropId),
          isFromGarden: true,
        });
      }
    }
  } else {
    // Keep existing as default if no crop added to garden
    for (const kb of KB_CROPS) {
      seenIds.add(kb.id);
      result.push({
        id: kb.id,
        name: kb.name.en,
        icon: getCropIcon(kb.id),
      });
    }
  }

  // Also include any custom crops that the user added
  for (const c of customCrops) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      result.push({
        id: c.id,
        name: c.name,
        icon: getCropIcon(c.id),
        isCustom: true,
      });
    }
  }

  return result;
}
