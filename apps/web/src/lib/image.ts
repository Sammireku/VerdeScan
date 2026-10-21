// T-009: Client-Side Image Compression, EXIF Stripping & Quality Analysis (Section 9)
import type { PlantPart } from '@verdescan/shared';

export interface ImageProcessingResult {
  blob: Blob;
  base64: string;
  width: number;
  height: number;
  quality: {
    isBlurry: boolean;
    isDark: boolean;
    blurScore: number;
    luminance: number;
    warnings: string[];
  };
}

export interface DiagnosisCaptureImage {
  id: string;
  blob: Blob;
  previewUrl: string;
  base64: string;
  part: PlantPart;
  width: number;
  height: number;
  quality: ImageProcessingResult['quality'];
}

/**
 * Strips EXIF GPS metadata by re-encoding via an HTML Canvas element.
 * Downscales longest edge to maxPx (default 1024) and outputs JPEG quality 0.8.
 */
export async function processImageFile(
  file: File | Blob,
  maxPx = 1024
): Promise<ImageProcessingResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width >= height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }

      // Re-encode via canvas — this strips all EXIF headers and GPS metadata
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // On-device quality analysis: brightness and variance
      const imageData = ctx.getImageData(0, 0, width, height);
      const quality = assessImageQuality(imageData);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas compression failed'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1] || '';
            resolve({
              blob,
              base64,
              width,
              height,
              quality,
            });
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file'));
    };

    img.src = url;
  });
}

/**
 * Calculates mean luminance and Laplacian variance (blur/darkness check)
 */
export function assessImageQuality(imageData: ImageData): ImageProcessingResult['quality'] {
  const { data, width, height } = imageData;
  let totalLuminance = 0;
  const pixelCount = width * height;

  // Grayscale luminance buffer
  const gray = new Float32Array(pixelCount);

  // Compute brightness (mean luminance)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[p] = lum;
    totalLuminance += lum;
  }

  const meanLuminance = totalLuminance / pixelCount;
  const isDark = meanLuminance < 45; // Low-light underexposure threshold

  // Laplacian kernel [0, 1, 0; 1, -4, 1; 0, 1, 0]
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let sampleCount = 0;

  const step = 2; // High-precision sampling
  for (let y = 1; y < height - 1; y += step) {
    const rowOffset = y * width;
    const topRow = (y - 1) * width;
    const bottomRow = (y + 1) * width;

    for (let x = 1; x < width - 1; x += step) {
      const center = gray[rowOffset + x];
      const top = gray[topRow + x];
      const bottom = gray[bottomRow + x];
      const left = gray[rowOffset + (x - 1)];
      const right = gray[rowOffset + (x + 1)];

      const lap = top + bottom + left + right - 4 * center;
      laplacianSum += lap;
      laplacianSqSum += lap * lap;
      sampleCount++;
    }
  }

  const laplacianMean = sampleCount > 0 ? laplacianSum / sampleCount : 0;
  const variance = sampleCount > 0 ? Math.max(0, (laplacianSqSum / sampleCount) - (laplacianMean * laplacianMean)) : 0;
  const isBlurry = variance < 35; // Blur threshold based on Laplacian variance

  const warnings: string[] = [];
  if (isBlurry) {
    warnings.push('Photo is blurry. Tap to retake.');
  }
  if (isDark) {
    warnings.push('Photo is dark. Tap to retake in daylight.');
  }

  return {
    isBlurry,
    isDark,
    blurScore: Math.round(variance),
    luminance: Math.round(meanLuminance),
    warnings,
  };
}
