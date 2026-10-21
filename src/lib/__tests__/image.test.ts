// UI-003: On-Device Laplacian Variance & Luminance Quality Assessment Tests
import { describe, expect, it } from 'vitest';
import { assessImageQuality } from '../image';

describe('assessImageQuality (Laplacian variance & darkness detection)', () => {
  it('flags flat/uniform images as blurry with correct warning', () => {
    // 50x50 flat gray image
    const width = 50;
    const height = 50;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128;     // R
      data[i + 1] = 128; // G
      data[i + 2] = 128; // B
      data[i + 3] = 255; // A
    }

    const imageData = {
      data,
      width,
      height,
      colorSpace: 'srgb' as PredefinedColorSpace,
    } as ImageData;

    const result = assessImageQuality(imageData);
    expect(result.isBlurry).toBe(true);
    expect(result.warnings).toContain('Photo is blurry. Tap to retake.');
    expect(result.isDark).toBe(false);
  });

  it('flags dark images when mean luminance is under threshold', () => {
    const width = 40;
    const height = 40;
    const data = new Uint8ClampedArray(width * height * 4);
    // Dark pixels (luminance ~20)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20;
      data[i + 1] = 20;
      data[i + 2] = 20;
      data[i + 3] = 255;
    }

    const imageData = {
      data,
      width,
      height,
      colorSpace: 'srgb' as PredefinedColorSpace,
    } as ImageData;

    const result = assessImageQuality(imageData);
    expect(result.isDark).toBe(true);
    expect(result.warnings).toContain('Photo is dark. Tap to retake in daylight.');
  });

  it('recognizes sharp high-frequency edge content as non-blurry', () => {
    const width = 60;
    const height = 60;
    const data = new Uint8ClampedArray(width * height * 4);
    // Checkerboard high-frequency pattern simulating crisp leaf veins
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const val = ((x % 4 < 2) !== (y % 4 < 2)) ? 220 : 60;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }

    const imageData = {
      data,
      width,
      height,
      colorSpace: 'srgb' as PredefinedColorSpace,
    } as ImageData;

    const result = assessImageQuality(imageData);
    expect(result.isBlurry).toBe(false);
    expect(result.isDark).toBe(false);
    expect(result.warnings).not.toContain('Photo is blurry. Tap to retake.');
    expect(result.warnings).not.toContain('Photo is dark. Tap to retake in daylight.');
  });
});
