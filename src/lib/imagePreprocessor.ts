/**
 * Image Preprocessing Pipeline
 * 
 * Handles brightness/contrast normalization, noise reduction,
 * and orientation correction for both digital CTs and mobile photos.
 */

/**
 * Applies a 3x3 median filter for noise reduction (handles camera noise).
 */
const applyMedianFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);
  output.set(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const neighbors: number[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            neighbors.push(data[((y + dy) * width + (x + dx)) * 4 + c]);
          }
        }
        neighbors.sort((a, b) => a - b);
        output[(y * width + x) * 4 + c] = neighbors[4]; // median
      }
    }
  }
  return output;
};

/**
 * Normalizes brightness and contrast using histogram stretching.
 */
const normalizeBrightnessContrast = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray => {
  const output = new Uint8ClampedArray(data.length);
  output.set(data);

  // Find min/max brightness across image
  let minB = 255, maxB = 0;
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (brightness < minB) minB = brightness;
    if (brightness > maxB) maxB = brightness;
  }

  const range = maxB - minB;
  if (range < 20) return output; // already very flat, skip

  // Stretch histogram to 0-255
  const scale = 255 / range;
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    for (let c = 0; c < 3; c++) {
      output[idx + c] = Math.min(255, Math.max(0, Math.round((data[idx + c] - minB) * scale)));
    }
    output[idx + 3] = 255;
  }
  return output;
};

/**
 * Detects if image is tilted and corrects orientation.
 * Uses edge detection to find dominant angle and rotates if needed.
 */
const correctOrientation = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  size: number
): void => {
  const data = ctx.getImageData(0, 0, size, size).data;

  // Simple tilt detection: check if left/right edge brightness is asymmetric
  // suggesting the image is rotated
  let leftEdgeSum = 0, rightEdgeSum = 0;
  let topEdgeSum = 0, bottomEdgeSum = 0;
  const edgeWidth = Math.floor(size * 0.05);

  for (let y = 0; y < size; y++) {
    for (let dx = 0; dx < edgeWidth; dx++) {
      const lIdx = (y * size + dx) * 4;
      const rIdx = (y * size + (size - 1 - dx)) * 4;
      leftEdgeSum += (data[lIdx] + data[lIdx + 1] + data[lIdx + 2]) / 3;
      rightEdgeSum += (data[rIdx] + data[rIdx + 1] + data[rIdx + 2]) / 3;
    }
  }
  for (let x = 0; x < size; x++) {
    for (let dy = 0; dy < edgeWidth; dy++) {
      const tIdx = (dy * size + x) * 4;
      const bIdx = ((size - 1 - dy) * size + x) * 4;
      topEdgeSum += (data[tIdx] + data[tIdx + 1] + data[tIdx + 2]) / 3;
      bottomEdgeSum += (data[bIdx] + data[bIdx + 1] + data[bIdx + 2]) / 3;
    }
  }

  const lrImbalance = Math.abs(leftEdgeSum - rightEdgeSum) / (leftEdgeSum + rightEdgeSum + 1);
  const tbImbalance = Math.abs(topEdgeSum - bottomEdgeSum) / (topEdgeSum + bottomEdgeSum + 1);

  // If significant asymmetry detected, apply small corrective rotation
  if (lrImbalance > 0.15 || tbImbalance > 0.15) {
    const angle = lrImbalance > tbImbalance
      ? (leftEdgeSum > rightEdgeSum ? -3 : 3)
      : (topEdgeSum > bottomEdgeSum ? -2 : 2);

    const imageData = ctx.getImageData(0, 0, size, size);
    ctx.save();
    ctx.clearRect(0, 0, size, size);
    ctx.translate(size / 2, size / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  }
};

/**
 * Full preprocessing pipeline: normalize, denoise, and correct orientation.
 * Returns processed canvas context data.
 */
export const preprocessImage = (
  imageUrl: string,
  size: number = 128
): Promise<{ data: Uint8ClampedArray; canvas: HTMLCanvasElement }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);

      // Step 1: Orientation correction
      correctOrientation(canvas, ctx, size);

      // Step 2: Get pixel data and normalize brightness/contrast
      let pixelData = ctx.getImageData(0, 0, size, size).data;
      const normalized = normalizeBrightnessContrast(pixelData, size, size);

      // Step 3: Apply median filter for noise reduction
      const denoised = applyMedianFilter(normalized, size, size);

      // Write back processed data
      const imageData = new ImageData(new Uint8ClampedArray(denoised.buffer), size, size);
      ctx.putImageData(imageData, 0, 0);

      resolve({ data: denoised, canvas });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};
