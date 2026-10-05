/**
 * Nitidezza della foto: varianza del Laplaciano su una versione ridotta in
 * scala di grigi. Valori bassi = pochi bordi netti = foto probabilmente
 * sfocata (soglia in SPINE_PIPELINE.blurThreshold, da calibrare).
 */
export function blurScore(image: ImageData, maxSide: number): number {
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(3, Math.round(image.width * scale));
  const height = Math.max(3, Math.round(image.height * scale));
  const gray = new Float32Array(width * height);
  const src = image.data;

  // riduzione per campionamento al centro della cella
  for (let y = 0; y < height; y++) {
    const sy = Math.min(image.height - 1, Math.floor((y + 0.5) / scale));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(image.width - 1, Math.floor((x + 0.5) / scale));
      const i = (sy * image.width + sx) * 4;
      gray[y * width + x] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    }
  }

  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const laplacian = gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count++;
    }
  }
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}
