/**
 * Sfocatura della foto, da 0 (nitida) a 1 (molto sfocata), con il metodo
 * "re-blur" (Crété-Roffet et al., 2007): si sfoca di nuovo l'immagine e si
 * misura quanto cambiano le differenze fra pixel vicini. Una foto nitida perde
 * molto, una già sfocata quasi niente. Non dipende dal contrasto (un dorso
 * chiaro su fondo scuro non sembra più nitido) e, con la riduzione a media e il
 * filtro mediano prima della misura, la grana delle foto con poca luce non
 * passa per dettaglio. Soglia in SPINE_PIPELINE.blurThreshold.
 */
export function blurScore(image: ImageData, maxSide: number): number {
  const { gray, width, height } = medianFilter3(downscaleGray(image, maxSide));
  return Math.max(
    reblurAmount(gray, width, height, 1, 0),
    reblurAmount(gray, width, height, 0, 1),
  );
}

/** Lato della sfocatura di confronto (media mobile), in pixel della versione ridotta. */
const REBLUR_SIZE = 9;

interface GrayImage {
  gray: Float32Array;
  width: number;
  height: number;
}

/** Scala di grigi ridotta facendo la media di ogni cella (attenua la grana, a differenza del campionamento). */
function downscaleGray(image: ImageData, maxSide: number): GrayImage {
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(3, Math.round(image.width * scale));
  const height = Math.max(3, Math.round(image.height * scale));
  const gray = new Float32Array(width * height);
  const src = image.data;

  for (let y = 0; y < height; y++) {
    const y0 = Math.floor((y * image.height) / height);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * image.height) / height));
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor((x * image.width) / width);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * image.width) / width));
      let sum = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * image.width + sx) * 4;
          sum += 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
        }
      }
      gray[y * width + x] = sum / ((y1 - y0) * (x1 - x0));
    }
  }
  return { gray, width, height };
}

/** Mediano 3×3: toglie i puntini di grana lasciando i bordi netti. */
function medianFilter3({ gray, width, height }: GrayImage): GrayImage {
  const out = new Float32Array(width * height);
  const window = new Float32Array(9);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = Math.min(height - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.min(width - 1, Math.max(0, x + dx));
          window[n++] = gray[yy * width + xx];
        }
      }
      window.sort();
      out[y * width + x] = window[4];
    }
  }
  return { gray: out, width, height };
}

/**
 * Quota di variazione fra pixel vicini che la nuova sfocatura NON toglie, lungo
 * una direzione (dx, dy): vicina a 1 se l'immagine era già sfocata.
 */
function reblurAmount(gray: Float32Array, width: number, height: number, dx: number, dy: number): number {
  const radius = Math.floor(REBLUR_SIZE / 2);
  const blurred = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = Math.min(width - 1, Math.max(0, x + k * dx));
        const yy = Math.min(height - 1, Math.max(0, y + k * dy));
        sum += gray[yy * width + xx];
      }
      blurred[y * width + x] = sum / REBLUR_SIZE;
    }
  }

  let original = 0;
  let lost = 0;
  for (let y = dy; y < height; y++) {
    for (let x = dx; x < width; x++) {
      const i = y * width + x;
      const prev = (y - dy) * width + (x - dx);
      const diff = Math.abs(gray[i] - gray[prev]);
      const diffBlurred = Math.abs(blurred[i] - blurred[prev]);
      original += diff;
      lost += Math.max(0, diff - diffBlurred);
    }
  }
  // immagine uniforme: niente bordi da misurare, la si considera sfocata
  return original > 0 ? (original - lost) / original : 1;
}
