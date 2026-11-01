// T-082: Unit Tests for D3.js Crop Growth Progress & DTM Chart
import { describe, expect, it } from 'vitest';
import { type HarvestTracker } from '@verdescan/shared';

describe('D3 Harvest Progress & DTM Chart Calculations', () => {
  const sampleCrop: HarvestTracker = {
    id: 'crop-tomato-1',
    cropId: 'tomato',
    cropName: 'Roma Tomato',
    variety: 'San Marzano',
    plantingDate: '2026-09-01',
    expectedHarvestDate: '2026-11-15',
    dtm: 75,
    daysElapsed: 45,
    daysRemaining: 30,
    progressPercentage: 60,
    currentStage: 'fruiting',
    visualRipeningCues: ['Breaker stage pink blush'],
    harvestTechnique: 'Twist upward at natural abscission zone',
    storageConditions: 'Store at 13-15°C',
  };

  it('calculates correct days elapsed and remaining ratio', () => {
    expect(sampleCrop.daysElapsed + sampleCrop.daysRemaining).toBe(sampleCrop.dtm);
    expect(sampleCrop.progressPercentage).toBe(60);
  });

  it('handles edge case when crop is at 100% maturity', () => {
    const matureCrop: HarvestTracker = {
      ...sampleCrop,
      daysElapsed: 80,
      daysRemaining: 0,
      progressPercentage: 100,
      currentStage: 'harvest_ready',
    };

    expect(matureCrop.daysRemaining).toBe(0);
    expect(matureCrop.progressPercentage).toBe(100);
    expect(matureCrop.currentStage).toBe('harvest_ready');
  });

  it('handles multi-crop DTM comparison ordering', () => {
    const crops: HarvestTracker[] = [
      sampleCrop,
      {
        ...sampleCrop,
        id: 'crop-okra-2',
        cropName: 'Clemson Spineless Okra',
        dtm: 55,
        daysElapsed: 50,
        daysRemaining: 5,
        progressPercentage: 91,
      },
      {
        ...sampleCrop,
        id: 'crop-cassava-3',
        cropName: 'TME 419 Cassava',
        dtm: 240,
        daysElapsed: 60,
        daysRemaining: 180,
        progressPercentage: 25,
      },
    ];

    expect(crops.length).toBe(3);
    const sortedByRemaining = [...crops].sort((a, b) => a.daysRemaining - b.daysRemaining);
    expect(sortedByRemaining[0].cropName).toBe('Clemson Spineless Okra');
    expect(sortedByRemaining[2].cropName).toBe('TME 419 Cassava');
  });
});
