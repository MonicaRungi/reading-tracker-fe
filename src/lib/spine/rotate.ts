/** Senso della rotazione di 90°: 1 = orario ("Ruota a destra"), -1 = antiorario. */
export type RotationDirection = 1 | -1;

/** Ruota un'immagine di 90°: larghezza e altezza si scambiano. */
export function rotateImage90(image: ImageData, direction: RotationDirection): ImageData {
  const { width, height } = image;
  const out = new ImageData(height, width);
  const src = new Uint32Array(image.data.buffer, image.data.byteOffset, width * height);
  const dst = new Uint32Array(out.data.buffer);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // orario: (x, y) → (height - 1 - y, x); antiorario: (x, y) → (y, width - 1 - x)
      const target =
        direction === 1 ? x * height + (height - 1 - y) : (width - 1 - x) * height + y;
      dst[target] = src[y * width + x];
    }
  }
  return out;
}
