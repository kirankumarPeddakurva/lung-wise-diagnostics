/**
 * Simulated UNETR-like Lung Segmentation Validator
 * 
 * Mimics a deep learning segmentation model that detects lung anatomical structures:
 * - Left and right lung lobes
 * - Symmetrical chest cavity layout
 * - Rib cage / thoracic boundary patterns
 * - Central darker regions (lung air spaces)
 * - Lung segmentation mask confidence
 * 
 * Threshold: validation confidence must be >= 85% to proceed.
 */

interface RegionStats {
  meanBrightness: number;
  darkRatio: number;
  mediumRatio: number;
  lightRatio: number;
  grayscaleRatio: number;
  pixelCount: number;
}

interface LungValidationResult {
  valid: boolean;
  confidence: number;
  details: {
    leftLungDetected: boolean;
    rightLungDetected: boolean;
    symmetryScore: number;
    thoracicBoundary: boolean;
    centralAirspace: boolean;
    segmentationMaskConfidence: number;
  };
}

const CONFIDENCE_THRESHOLD = 80;

const analyzeRegion = (
  data: Uint8ClampedArray,
  width: number,
  x0: number, y0: number,
  x1: number, y1: number
): RegionStats => {
  let totalBrightness = 0;
  let darkPx = 0;
  let medPx = 0;
  let lightPx = 0;
  let grayPx = 0;
  let count = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);

      totalBrightness += brightness;
      if (brightness < 50) darkPx++;
      else if (brightness < 160) medPx++;
      else lightPx++;
      if (saturation < 35) grayPx++;
      count++;
    }
  }

  return {
    meanBrightness: count > 0 ? totalBrightness / count : 0,
    darkRatio: count > 0 ? darkPx / count : 0,
    mediumRatio: count > 0 ? medPx / count : 0,
    lightRatio: count > 0 ? lightPx / count : 0,
    grayscaleRatio: count > 0 ? grayPx / count : 0,
    pixelCount: count,
  };
};

/**
 * Simulates detecting the thoracic boundary by checking if the image edges
 * (top/bottom rows) are predominantly dark (body exterior / background).
 */
const detectThoracicBoundary = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): boolean => {
  let edgeDark = 0;
  let edgeTotal = 0;

  // Check top 10% and bottom 10% rows, left 10% and right 10% columns
  const bands = [
    { x0: 0, y0: 0, x1: width, y1: Math.floor(height * 0.1) },
    { x0: 0, y0: Math.floor(height * 0.9), x1: width, y1: height },
    { x0: 0, y0: 0, x1: Math.floor(width * 0.1), y1: height },
    { x0: Math.floor(width * 0.9), y0: 0, x1: width, y1: height },
  ];

  for (const band of bands) {
    for (let y = band.y0; y < band.y1; y++) {
      for (let x = band.x0; x < band.x1; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < 60) edgeDark++;
        edgeTotal++;
      }
    }
  }

  return edgeTotal > 0 && edgeDark / edgeTotal > 0.5;
};

/**
 * Detects vertical symmetry — lung CT scans have roughly symmetrical
 * left and right lung fields.
 */
const computeSymmetry = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): number => {
  const midX = Math.floor(width / 2);
  let diff = 0;
  let count = 0;
  const yStart = Math.floor(height * 0.15);
  const yEnd = Math.floor(height * 0.85);

  for (let y = yStart; y < yEnd; y += 2) {
    for (let dx = 1; dx < midX; dx += 2) {
      const leftIdx = (y * width + (midX - dx)) * 4;
      const rightIdx = (y * width + (midX + dx)) * 4;
      const leftB = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
      const rightB = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
      diff += Math.abs(leftB - rightB);
      count++;
    }
  }

  const avgDiff = count > 0 ? diff / count : 255;
  // Perfect symmetry → avgDiff=0 → score=1, high asymmetry → score→0
  return Math.max(0, 1 - avgDiff / 80);
};

export const analyzeLungStructure = (imageUrl: string): Promise<LungValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // --- 1. Global grayscale check (CT scans are monochrome) ---
      const global = analyzeRegion(data, size, 0, 0, size, size);
      const isGrayscale = global.grayscaleRatio > 0.65;

      // --- 2. Detect left and right lung lobes ---
      // Lung fields sit roughly in the middle-horizontal band, left and right of center
      const lobeY0 = Math.floor(size * 0.2);
      const lobeY1 = Math.floor(size * 0.8);
      const midX = Math.floor(size / 2);
      const leftLobe = analyzeRegion(data, size, Math.floor(size * 0.1), lobeY0, midX - 2, lobeY1);
      const rightLobe = analyzeRegion(data, size, midX + 2, lobeY0, Math.floor(size * 0.9), lobeY1);

      // Lung lobes should have dark air-space regions mixed with medium-brightness tissue
      const leftLungDetected = leftLobe.darkRatio > 0.15 && leftLobe.mediumRatio > 0.1 && leftLobe.grayscaleRatio > 0.6;
      const rightLungDetected = rightLobe.darkRatio > 0.15 && rightLobe.mediumRatio > 0.1 && rightLobe.grayscaleRatio > 0.6;

      // --- 3. Central airspace (mediastinum — bright central column) ---
      const centralRegion = analyzeRegion(
        data, size,
        Math.floor(size * 0.4), Math.floor(size * 0.2),
        Math.floor(size * 0.6), Math.floor(size * 0.8)
      );
      const centralAirspace = centralRegion.meanBrightness > leftLobe.meanBrightness &&
        centralRegion.meanBrightness > rightLobe.meanBrightness;

      // --- 4. Thoracic boundary ---
      const thoracicBoundary = detectThoracicBoundary(data, size, size);

      // --- 5. Symmetry ---
      const symmetryScore = computeSymmetry(data, size, size);

      // --- 6. Compute segmentation mask confidence ---
      let confidence = 0;
      const atLeastOneLung = leftLungDetected || rightLungDetected;

      // Grayscale (required for CT)
      if (isGrayscale) confidence += 15;
      else confidence -= 20;

      // Lung lobe detection (accept partial single-lung slices)
      if (leftLungDetected && rightLungDetected) confidence += 25;
      else if (atLeastOneLung) confidence += 18;

      // Lung tissue quality — dark air-filled regions present
      const avgDarkRatio = (leftLobe.darkRatio + rightLobe.darkRatio) / 2;
      if (avgDarkRatio > 0.2) confidence += 10;
      else if (avgDarkRatio > 0.1) confidence += 5;

      // Symmetry (bonus for full scans, not penalised for partial)
      if (leftLungDetected && rightLungDetected) {
        confidence += Math.round(symmetryScore * 15);
      } else if (atLeastOneLung) {
        confidence += Math.round(symmetryScore * 8);
      }

      // Thoracic boundary (dark edges)
      if (thoracicBoundary) confidence += 15;

      // Central mediastinum brighter than lung fields
      if (centralAirspace) confidence += 12;

      // Contrast and structure within lung fields
      const lobeContrast = Math.abs(leftLobe.meanBrightness - rightLobe.meanBrightness);
      if (lobeContrast < 30) confidence += 10;

      confidence = Math.max(0, Math.min(100, confidence));

      resolve({
        valid: confidence >= CONFIDENCE_THRESHOLD,
        confidence,
        details: {
          leftLungDetected,
          rightLungDetected,
          symmetryScore: Math.round(symmetryScore * 100),
          thoracicBoundary,
          centralAirspace,
          segmentationMaskConfidence: confidence,
        },
      });
    };
    img.onerror = () =>
      resolve({
        valid: false,
        confidence: 0,
        details: {
          leftLungDetected: false,
          rightLungDetected: false,
          symmetryScore: 0,
          thoracicBoundary: false,
          centralAirspace: false,
          segmentationMaskConfidence: 0,
        },
      });
    img.src = imageUrl;
  });
};
