import type { EnhanceSettings } from "./config";

/**
 * Miglioramento della costola raddrizzata, senza appiattire né snaturare i colori.
 * Ordine (TODO §3.3): denoise → bilanciamento del bianco → auto-levels →
 * gamma → curva a S → saturazione → unsharp mask.
 * Livelli, gamma e curva agiscono sulla luminanza: diventano una tabella di 256
 * fattori, applicata in un passaggio moltiplicando i tre canali.
 *
 * Due scelte per non cambiare la tinta della costola:
 * - bilanciamento gray-world, esposizione e punti di nero/bianco si stimano sulla
 *   foto intera (sceneStats),
 *   non sulla costola ritagliata: una costola è quasi tutta di un colore, e la
 *   sua media non è "grigio" (un marrone verrebbe corretto verso il viola);
 * - livelli, gamma e curva lavorano sulla luminanza e si applicano con lo stesso
 *   fattore ai tre canali: tinta e saturazione non cambiano (stirare i canali
 *   separatamente cambia la tinta e, con poca luce, gonfia i colori). Lo
 *   stiramento ha limiti (levelsMaxBlack/levelsMinWhite): una costola è quasi
 *   tutta del suo colore e senza limiti il suo stesso corpo diventerebbe "nero".
 */

export type EnhanceTimings = Record<string, number>;

/** Sfocatura 3×3 separabile [1 2 1]/4, con i bordi replicati. Ritorna un buffer nuovo. */
function blur3(src: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const tmp = new Uint16Array(src.length);
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const l = (row + Math.max(0, x - 1)) * 4;
      const c = (row + x) * 4;
      const r = (row + Math.min(width - 1, x + 1)) * 4;
      for (let k = 0; k < 3; k++) tmp[c + k] = src[l + k] + 2 * src[c + k] + src[r + k];
      tmp[c + 3] = src[c + 3] * 4;
    }
  }
  for (let y = 0; y < height; y++) {
    const up = Math.max(0, y - 1) * width;
    const row = y * width;
    const down = Math.min(height - 1, y + 1) * width;
    for (let x = 0; x < width; x++) {
      const u = (up + x) * 4;
      const c = (row + x) * 4;
      const d = (down + x) * 4;
      for (let k = 0; k < 4; k++) out[c + k] = (tmp[u + k] + 2 * tmp[c + k] + tmp[d + k] + 8) >> 4;
    }
  }
  return out;
}

function percentile(histogram: Uint32Array, total: number, fraction: number): number {
  const target = total * fraction;
  let count = 0;
  for (let value = 0; value < 256; value++) {
    count += histogram[value];
    if (count > target) return value;
  }
  return 255;
}

/**
 * Curva a S attorno a `pivot` (la luminanza media della costola): scurisce le
 * ombre sotto e schiarisce le luci sopra, lasciando invariati 0, pivot e 1.
 * Attorno al grigio fisso (0,5) scurirebbe tutta la costola, quasi sempre scura.
 */
function sCurve(x: number, amount: number, pivot: number): number {
  const k = 1 + amount;
  if (x <= pivot) return pivot * Math.pow(x / pivot, k);
  return 1 - (1 - pivot) * Math.pow((1 - x) / (1 - pivot), k);
}

export type WhiteBalanceGains = [number, number, number];

/** Misure della foto intera (non della costola): luce dominante ed esposizione. */
export interface SceneStats {
  gains: WhiteBalanceGains;
  /** Luminanza media 0–1. */
  luma: number;
  /** Istogramma della luminanza (0–255), da cui gli auto-levels prendono nero e bianco. */
  lumaHistogram: Uint32Array;
  samples: number;
}

const LUMA = [0.2126, 0.7152, 0.0722] as const;
/** Pixel campionati (al massimo) per stimare il bilanciamento sulla foto intera. */
const WB_SAMPLES = 200_000;

/**
 * Misure sulla foto intera (campionata). Guadagni gray-world pieni, che portano
 * la media di ogni canale verso la media grigia (l'attenuazione la applica il
 * preset), e luminanza media, che decide se serve la gamma.
 */
export function sceneStats(image: ImageData): SceneStats {
  const data = image.data;
  const step = Math.max(1, Math.floor(data.length / 4 / WB_SAMPLES)) * 4;
  const sums = [0, 0, 0];
  const lumaHistogram = new Uint32Array(256);
  let count = 0;
  for (let i = 0; i < data.length; i += step) {
    sums[0] += data[i];
    sums[1] += data[i + 1];
    sums[2] += data[i + 2];
    lumaHistogram[Math.round(LUMA[0] * data[i] + LUMA[1] * data[i + 1] + LUMA[2] * data[i + 2])]++;
    count++;
  }
  const means = sums.map((sum) => sum / count);
  const gray = (means[0] + means[1] + means[2]) / 3;
  return {
    gains: means.map((mean) => (mean > 0 ? gray / mean : 1)) as WhiteBalanceGains,
    luma: (LUMA[0] * means[0] + LUMA[1] * means[1] + LUMA[2] * means[2]) / 255,
    lumaHistogram,
    samples: count,
  };
}

interface ToneMapping {
  /** Guadagni del bilanciamento, già attenuati dal preset. */
  gains: [number, number, number];
  /** Per ogni luminanza (0–255) dopo il bilanciamento: fattore per cui moltiplicare i tre canali. */
  factors: Float32Array;
}

/**
 * Bilanciamento per canale + livelli, gamma e curva a S sulla sola luminanza.
 * Il tono si applica moltiplicando i tre canali per lo stesso fattore: tinta e
 * saturazione restano quelle della foto (toglierle il nero canale per canale
 * gonfierebbe i colori, soprattutto con poca luce).
 */
function buildToneMapping(data: Uint8ClampedArray, s: EnhanceSettings, scene: SceneStats): ToneMapping {
  const pixels = data.length / 4;
  // gray-world attenuato dal preset
  const gains = scene.gains.map((gain) => 1 + (gain - 1) * s.whiteBalance) as ToneMapping["gains"];

  const lumaHistogram = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    const l = LUMA[0] * data[i] * gains[0] + LUMA[1] * data[i + 1] * gains[1] + LUMA[2] * data[i + 2] * gains[2];
    lumaHistogram[Math.min(255, Math.round(l))]++;
  }

  // auto-levels: nero e bianco della foto intera (come ha esposto la fotocamera),
  // non della costola (che dice solo di che colore è il libro), entro i limiti del preset
  const low = Math.min(s.levelsMaxBlack, percentile(scene.lumaHistogram, scene.samples, s.levelsClip));
  const high = Math.max(s.levelsMinWhite, percentile(scene.lumaHistogram, scene.samples, 1 - s.levelsClip));
  const levels = (value: number) => Math.min(1, Math.max(0, (value - low) / (high - low)));

  // gamma solo se la foto intera è scura (poca luce), non se la costola è scura di suo
  const gamma =
    scene.luma > 0 && scene.luma < s.gammaThreshold
      ? Math.max(s.gammaMin, Math.log(0.45) / Math.log(scene.luma))
      : 1;

  // perno della curva: luminanza media della costola dopo livelli e gamma
  let pivot = 0;
  for (let value = 0; value < 256; value++) pivot += lumaHistogram[value] * Math.pow(levels(value), gamma);
  pivot = Math.min(0.9, Math.max(0.1, pivot / pixels));

  const factors = new Float32Array(256);
  for (let value = 0; value < 256; value++) {
    const target = sCurve(Math.pow(levels(value), gamma), s.contrast, pivot) * 255;
    factors[value] = value === 0 ? 0 : target / value;
  }
  return { gains, factors };
}

function now() {
  return performance.now();
}

/**
 * Ritorna una nuova immagine. `scene` viene da sceneStats() sulla foto intera;
 * `timings` (facoltativo) riceve i ms di ogni passaggio.
 */
export function enhance(
  image: ImageData,
  s: EnhanceSettings,
  scene: SceneStats,
  timings?: EnhanceTimings,
): ImageData {
  const { width, height } = image;
  let t = now();
  const mark = (step: string) => {
    if (timings) timings[step] = now() - t;
    t = now();
  };

  // 1. denoise leggero, prima di qualsiasi nitidezza
  let data = new Uint8ClampedArray(image.data);
  if (s.denoiseMix > 0) {
    const blurred = blur3(data, width, height);
    for (let i = 0; i < data.length; i += 4) {
      for (let k = 0; k < 3; k++) data[i + k] += (blurred[i + k] - data[i + k]) * s.denoiseMix;
    }
  }
  mark("denoise");

  // 2–5. bilanciamento per canale, poi livelli, gamma e curva a S sulla luminanza
  const tone = buildToneMapping(data, s, scene);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] * tone.gains[0];
    const g = data[i + 1] * tone.gains[1];
    const b = data[i + 2] * tone.gains[2];
    const factor = tone.factors[Math.min(255, Math.round(LUMA[0] * r + LUMA[1] * g + LUMA[2] * b))];
    data[i] = r * factor;
    data[i + 1] = g * factor;
    data[i + 2] = b * factor;
  }
  mark("levels");

  // 6. saturazione attorno alla luminanza del pixel
  if (s.saturation !== 1) {
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      for (let k = 0; k < 3; k++) data[i + k] = l + (data[i + k] - l) * s.saturation;
    }
  }
  mark("saturation");

  // 7. unsharp mask (raggio ~1 px)
  if (s.sharpen > 0) {
    const blurred = blur3(data, width, height);
    const sharp = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      for (let k = 0; k < 3; k++) sharp[i + k] = data[i + k] + (data[i + k] - blurred[i + k]) * s.sharpen;
      sharp[i + 3] = data[i + 3];
    }
    data = sharp;
  }
  mark("sharpen");

  return new ImageData(data, width, height);
}
