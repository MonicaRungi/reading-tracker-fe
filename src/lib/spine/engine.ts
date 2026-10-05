import { PRESET_SETTINGS, SPINE_PIPELINE } from "./config";
import type { SpinePreset } from "./config";
import { canvasToBitmap, context2d, createCanvas } from "./canvas";
import { enhance, sceneStats } from "./enhance";
import type { EnhanceTimings, SceneStats } from "./enhance";
import { encodeSpine } from "./encode";
import type { EncodedSpine } from "./encode";
import { orientQuad, quadSize, warpQuad } from "./homography";
import type { Quad } from "./homography";
import { blurScore } from "./quality";
import { rotateImage90 } from "./rotate";
import type { RotationDirection } from "./rotate";

export type StepTimings = Record<string, number>;

export interface LoadedPhoto {
  /** Dimensioni della foto dopo la riduzione: i 4 angoli vanno espressi in questi pixel. */
  width: number;
  height: number;
  /** La foto ridotta, da mostrare nell'editor degli angoli. */
  preview: ImageBitmap;
  originalWidth: number;
  originalHeight: number;
  timings: StepTimings;
}

export interface ProcessedSpine {
  width: number;
  height: number;
  /** larghezza / altezza: va in library_items.spine_ratio. */
  ratio: number;
  /** Varianza del Laplaciano del dorso raddrizzato, prima del miglioramento. */
  blurScore: number;
  isBlurry: boolean;
  results: { preset: SpinePreset; image: ImageData }[];
  timings: StepTimings;
}

export interface EncodedResult extends EncodedSpine {
  timings: StepTimings;
}

function round(ms: number) {
  return Math.round(ms * 10) / 10;
}

/**
 * Pipeline della foto del dorso, senza stato condiviso col DOM: gira nel
 * worker (spine.worker.ts) o, se il browser non ha OffscreenCanvas nei worker,
 * sul thread principale (process.ts sceglie). Tiene in memoria la foto
 * decodificata e i risultati, così la foto originale viaggia una volta sola.
 */
export class SpineEngine {
  source: ImageData | null = null;
  /** Dimensioni della foto prima della riduzione (solo informative). */
  original = { width: 0, height: 0 };
  /** Luce dominante ed esposizione della foto intera, non del dorso. */
  scene: SceneStats = { gains: [1, 1, 1], luma: 0.5, lumaHistogram: new Uint32Array(256), samples: 0 };
  results = new Map<SpinePreset, ImageData>();

  async load(file: Blob): Promise<LoadedPhoto> {
    const timings: StepTimings = {};
    let t = performance.now();
    // imageOrientation: rispetta l'EXIF (foto scattate in verticale)
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    timings.decode = round(performance.now() - t);

    t = performance.now();
    const scale = Math.min(1, SPINE_PIPELINE.maxInputSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = createCanvas(width, height);
    const ctx = context2d(canvas);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    this.source = ctx.getImageData(0, 0, width, height);
    this.results.clear();
    timings.resize = round(performance.now() - t);

    t = performance.now();
    this.scene = sceneStats(this.source);
    timings.sceneStats = round(performance.now() - t);

    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;
    bitmap.close();
    this.original = { width: originalWidth, height: originalHeight };
    const preview = await canvasToBitmap(canvas);
    return { width, height, preview, originalWidth, originalHeight, timings };
  }

  /**
   * "Ruota a sinistra/destra" nell'editor degli angoli: ruota di 90° la foto già
   * ridotta (la scena non cambia, quindi le misure di sceneStats restano valide).
   */
  async rotate(direction: RotationDirection): Promise<LoadedPhoto> {
    if (!this.source) throw new Error("SpineEngine: nessuna foto caricata");
    const t = performance.now();
    this.source = rotateImage90(this.source, direction);
    this.original = { width: this.original.height, height: this.original.width };
    this.results.clear();
    const { width, height } = this.source;
    const canvas = createCanvas(width, height);
    context2d(canvas).putImageData(this.source, 0, 0);
    const preview = await canvasToBitmap(canvas);
    return {
      width,
      height,
      preview,
      originalWidth: this.original.width,
      originalHeight: this.original.height,
      timings: { rotate: round(performance.now() - t) },
    };
  }

  process(quad: Quad, presets: readonly SpinePreset[]): ProcessedSpine {
    if (!this.source) throw new Error("SpineEngine: nessuna foto caricata");
    const timings: StepTimings = {};
    let t = performance.now();

    const oriented = orientQuad(quad);
    const size = quadSize(oriented);
    // mai ingrandire oltre la risoluzione disponibile: si perderebbe nitidezza
    const height = Math.max(1, Math.round(Math.min(SPINE_PIPELINE.outputHeight, size.height)));
    const width = Math.max(1, Math.round((size.width / size.height) * height));
    const straight = warpQuad(this.source, oriented, width, height);
    timings.warp = round(performance.now() - t);

    t = performance.now();
    const score = blurScore(straight, SPINE_PIPELINE.blurSampleSide);
    timings.blurCheck = round(performance.now() - t);

    this.results.clear();
    const results = presets.map((preset) => {
      const settings = PRESET_SETTINGS[preset];
      t = performance.now();
      const steps: EnhanceTimings = {};
      const image = settings ? enhance(straight, settings, this.scene, steps) : straight;
      timings[`enhance:${preset}`] = round(performance.now() - t);
      for (const [step, ms] of Object.entries(steps)) timings[`  ${preset}.${step}`] = round(ms);
      this.results.set(preset, image);
      return { preset, image };
    });

    return {
      width,
      height,
      ratio: width / height,
      blurScore: Math.round(score * 10) / 10,
      isBlurry: score < SPINE_PIPELINE.blurThreshold,
      results,
      timings,
    };
  }

  async encode(preset: SpinePreset): Promise<EncodedResult> {
    const image = this.results.get(preset);
    if (!image) throw new Error(`SpineEngine: preset "${preset}" non elaborato`);
    const t = performance.now();
    const encoded = await encodeSpine(image);
    return { ...encoded, timings: { encode: round(performance.now() - t) } };
  }

  reset() {
    this.source = null;
    this.results.clear();
  }
}
