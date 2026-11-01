// T-080: Agronomy Tip of the Day Ingestion & Knowledge Base Tests
import { describe, expect, it } from 'vitest';
import {
  CURATED_AGRONOMY_TIPS,
  selectCuratedFallbackTip,
  getCachedDailyTip,
  saveDailyTip,
  type AgronomyTip,
} from '../agronomy-tips';

describe('Agronomy Tips Ingested Knowledge Base', () => {
  it('contains comprehensive extension tips grounded in UMass and Texas A&M research', () => {
    expect(CURATED_AGRONOMY_TIPS.length).toBeGreaterThanOrEqual(10);

    // Verify key principles from UMass and Texas A&M AgriLife bulletins
    const titles = CURATED_AGRONOMY_TIPS.map((t) => t.headline.toLowerCase());
    const bodies = CURATED_AGRONOMY_TIPS.map((t) => t.tip.toLowerCase());

    // 1. Solanaceae splash & pruning
    expect(titles.some((t) => t.includes('solanaceae') || t.includes('pruning'))).toBe(true);

    // 2. Disease triangle disruption
    expect(titles.some((t) => t.includes('disease triangle'))).toBe(true);

    // 3. Cucurbit insect exclusion
    expect(titles.some((t) => t.includes('cucurbit') || t.includes('beetle'))).toBe(true);

    // 4. Blossom end rot moisture
    expect(titles.some((t) => t.includes('blossom-end rot'))).toBe(true);

    // 5. Biofungicides (Bacillus subtilis)
    expect(bodies.some((b) => b.includes('bacillus subtilis'))).toBe(true);

    // 6. Sulfur safety restriction (never on cucurbits, never >85F)
    const sulfurTip = CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-sulfur-safety-warning');
    expect(sulfurTip).toBeDefined();
    expect(sulfurTip?.prohibitedPracticeWarning).toContain('NEVER apply sulfur to cucurbits');

    // 7. HortiFresh West Africa: Marigold bio-fumigation for nematodes
    const marigoldTip = CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-marigold-nematode-fumigation');
    expect(marigoldTip).toBeDefined();
    expect(marigoldTip?.extensionSource).toContain('HortiFresh West Africa');

    // 8. HortiFresh West Africa: Tomato mosaic virus 10% TSP seed soaking
    const tmvTip = CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-tomato-mosaic-virus-tsp');
    expect(tmvTip).toBeDefined();
    expect(tmvTip?.tip).toContain('trisodium phosphate');

    // 9. Purdue Extension: Colorado potato beetle straw mulch
    const cpbTip = CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-colorado-potato-beetle-straw');
    expect(cpbTip).toBeDefined();
    expect(cpbTip?.actionableStep).toContain('straw');

    // 10. Purdue Extension: Beer pie pan trap for slugs
    const slugTip = CURATED_AGRONOMY_TIPS.find((t) => t.id === 'tip-beer-slug-pie-pan');
    expect(slugTip).toBeDefined();
    expect(slugTip?.actionableStep).toContain('pie pans');
  });

  it('selects West Africa HortiFresh tips when location is Ghana/West Africa with tomatoes', () => {
    const tip = selectCuratedFallbackTip({
      location: 'Kumasi, Ghana',
      cropNames: ['Tomato'],
      temperature: 28,
    });
    expect(tip.extensionSource).toContain('HortiFresh');
  });

  it('selects Colorado potato beetle tip when potato or eggplant is grown', () => {
    const tip = selectCuratedFallbackTip({
      cropNames: ['Irish Potato'],
      temperature: 22,
    });
    expect(tip.id).toBe('tip-colorado-potato-beetle-straw');
  });

  it('selects slug beer trap tip in cool, rainy weather', () => {
    const tip = selectCuratedFallbackTip({
      condition: 'Steady Drizzle & Rain',
      temperature: 18,
    });
    expect(tip.id).toBe('tip-beer-slug-pie-pan');
  });

  it('selects hot-weather cucurbit safety tip when growing squash or cucumber in heat', () => {
    const tip = selectCuratedFallbackTip({
      cropNames: ['Cucumber', 'Squash'],
      temperature: 30,
    });
    expect(tip.id).toBe('tip-sulfur-safety-warning');
    expect(tip.category).toBe('organic_defense');
  });

  it('selects blossom-end rot tip when growing tomatoes or peppers in hot weather', () => {
    const tip = selectCuratedFallbackTip({
      cropNames: ['Roma Tomato', 'Habanero Pepper'],
      temperature: 32,
    });
    expect(tip.id).toBe('tip-blossom-end-rot');
    expect(tip.category).toBe('water_irrigation');
  });

  it('selects disease triangle humidity tip when rainy conditions occur', () => {
    const tip = selectCuratedFallbackTip({
      condition: 'Heavy Rain & Humid',
      temperature: 26,
    });
    expect(tip.id).toBe('tip-disease-triangle');
  });

  it('caches and retrieves daily tip in localStorage correctly', () => {
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    };

    const origWindow = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = { localStorage: mockStorage };

    try {
      const mockTip: AgronomyTip = {
        id: 'tip-test-1',
        headline: 'Mulching with Rice Straw',
        tip: 'Organic straw conserves soil moisture and minimizes thermal stress on root zones.',
        category: 'soil_health',
        extensionSource: 'UMass Extension',
        seasonContext: 'Dry Season',
        actionableStep: 'Apply 3 inches of clean straw around roots.',
        timestamp: Date.now(),
      };

      saveDailyTip(mockTip);
      const retrieved = getCachedDailyTip();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.headline).toBe('Mulching with Rice Straw');
    } finally {
      (globalThis as { window?: unknown }).window = origWindow;
    }
  });
});
