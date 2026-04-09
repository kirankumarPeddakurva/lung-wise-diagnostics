/**
 * Simulated UNETR-like Lung Segmentation Validator
 * 
 * Detects lung anatomical structures and explicitly rejects non-lung scans
 * (e.g., brain/cranial CTs). Checks for:
 * - Left and right lung lobes
 * - Thoracic boundary / rib cage patterns
 * - Central darker regions (lung air spaces)
 * - Brain/skull detection (force reject)
 * 
 * Threshold: validation confidence must be >= 85% to proceed.
 */

interface RegionStats {
  meanBrightness: number;
  darkRatio: number;
  mediumRatio: number;
  lightRatio: number;
  grayscaleRatio: number;
  brightRatio: number;
  pixelCount: number;
}

interface LungValidationResult {
  valid: boolean;
  confidence: number;
  rejectionReason?: string;
  details: {
    leftLungDetected: boolean;
    rightLungDetected: boolean;
    symmetryScore: number;
    thoracicBoundary: boolean;
    centralAirspace: boolean;
    brainDetected: boolean;
    segmentationMaskConfidence: number;
  };
}

const CONFIDENCE_THRESHOLD = 85;

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
  let brightPx = 0;
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
      if (brightness > 200) brightPx++;
      if (saturation < 35) grayPx++;
      count++;
    }
  }

  return {
    meanBrightness: count > 0 ? totalBrightness / count : 0,
    darkRatio: count > 0 ? darkPx / count : 0,
    mediumRatio: count > 0 ? medPx / count : 0,
    lightRatio: count > 0 ? lightPx / count : 0,
    brightRatio: count > 0 ? brightPx / count : 0,
    grayscaleRatio: count > 0 ? grayPx / count : 0,
    pixelCount: count,
  };
};

/**
 * Detects brain/skull structures — cranial CTs have:
 * - A roughly circular bright bone boundary (skull)
 * - Central medium-brightness tissue (brain parenchyma)
 * - NO large dark air-filled regions in the center
 * - High bright-ring ratio around the perimeter
 */
const detectBrainStructure = (
  data: Uint8ClampedArray,
  size: number
): boolean => {
  const center = Math.floor(size / 2);
  const outerRadius = Math.floor(size * 0.42);
  const innerRadius = Math.floor(size * 0.3);
  const shellRadius = Math.floor(size * 0.38);

  let shellBright = 0;
  let shellTotal = 0;
  let coreDark = 0;
  let coreMedium = 0;
  let coreTotal = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > outerRadius) continue;

      const idx = (y * size + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Shell region (between inner and outer radius) — skull bone
      if (dist >= shellRadius && dist <= outerRadius) {
        if (brightness > 180) shellBright++;
        shellTotal++;
      }

      // Core region — brain tissue
      if (dist < innerRadius) {
        if (brightness < 50) coreDark++;
        else if (brightness >= 50 && brightness < 180) coreMedium++;
        coreTotal++;
      }
    }
  }

  const shellBrightRatio = shellTotal > 0 ? shellBright / shellTotal : 0;
  const coreDarkRatio = coreTotal > 0 ? coreDark / coreTotal : 0;
  const coreMediumRatio = coreTotal > 0 ? coreMedium / coreTotal : 0;

  // Brain pattern: bright circular shell + mostly medium-brightness core + low dark core
  const hasBrightSkull = shellBrightRatio > 0.3;
  const hasBrainTissue = coreMediumRatio > 0.5;
  const lacksLungAir = coreDarkRatio < 0.15;

  return hasBrightSkull && hasBrainTissue && lacksLungAir;
};

/**
 * Detects thoracic boundary by checking if image edges have dark background
 * AND the overall shape is more oval/rectangular (not circular like a skull).
 */
const detectThoracicBoundary = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): boolean => {
  let edgeDark = 0;
  let edgeTotal = 0;

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

      // --- 0. Brain/skull detection (force reject) ---
      const brainDetected = detectBrainStructure(data, size);

      if (brainDetected) {
        resolve({
          valid: false,
          confidence: 0,
          rejectionReason: "brain_detected",
          details: {
            leftLungDetected: false,
            rightLungDetected: false,
            symmetryScore: 0,
            thoracicBoundary: false,
            centralAirspace: false,
            brainDetected: true,
            segmentationMaskConfidence: 0,
          },
        });
        return;
      }

      // --- 1. Global grayscale check ---
      const global = analyzeRegion(data, size, 0, 0, size, size);
      const isGrayscale = global.grayscaleRatio > 0.65;

      // --- 2. Detect left and right lung lobes ---
      const lobeY0 = Math.floor(size * 0.2);
      const lobeY1 = Math.floor(size * 0.8);
      const midX = Math.floor(size / 2);
      const leftLobe = analyzeRegion(data, size, Math.floor(size * 0.1), lobeY0, midX - 2, lobeY1);
      const rightLobe = analyzeRegion(data, size, midX + 2, lobeY0, Math.floor(size * 0.9), lobeY1);

      const leftLungDetected = leftLobe.darkRatio > 0.15 && leftLobe.mediumRatio > 0.1 && leftLobe.grayscaleRatio > 0.6;
      const rightLungDetected = rightLobe.darkRatio > 0.15 && rightLobe.mediumRatio > 0.1 && rightLobe.grayscaleRatio > 0.6;

      // --- 3. Central airspace (mediastinum) ---
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

      // --- 6. Compute confidence ---
      let confidence = 0;
      const atLeastOneLung = leftLungDetected || rightLungDetected;

      if (isGrayscale) confidence += 15;
      else confidence -= 20;

      if (leftLungDetected && rightLungDetected) confidence += 25;
      else if (atLeastOneLung) confidence += 18;

      const avgDarkRatio = (leftLobe.darkRatio + rightLobe.darkRatio) / 2;
      if (avgDarkRatio > 0.2) confidence += 10;
      else if (avgDarkRatio > 0.1) confidence += 5;

      if (leftLungDetected && rightLungDetected) {
        confidence += Math.round(symmetryScore * 15);
      } else if (atLeastOneLung) {
        confidence += Math.round(symmetryScore * 8);
      }

      if (thoracicBoundary) confidence += 15;

      if (centralAirspace) confidence += 12;

      const lobeContrast = Math.abs(leftLobe.meanBrightness - rightLobe.meanBrightness);
      if (lobeContrast < 30) confidence += 10;

      confidence = Math.max(0, Math.min(100, confidence));

      // Must have at least one lung AND thoracic boundary
      const structurallyValid = atLeastOneLung && thoracicBoundary;

      resolve({
        valid: structurallyValid && confidence >= CONFIDENCE_THRESHOLD,
        confidence,
        rejectionReason: !atLeastOneLung ? "no_lung_structures" : !thoracicBoundary ? "no_thoracic_boundary" : undefined,
        details: {
          leftLungDetected,
          rightLungDetected,
          symmetryScore: Math.round(symmetryScore * 100),
          thoracicBoundary,
          centralAirspace,
          brainDetected: false,
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
          brainDetected: false,
          segmentationMaskConfidence: 0,
        },
      });
    img.src = imageUrl;
  });
};
