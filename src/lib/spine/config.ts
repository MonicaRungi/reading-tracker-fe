/**
 * Costanti della pipeline della foto della costola, in un solo posto: vanno
 * tarate su foto reali (poca luce, luce calda, luce fredda) con la pagina di
 * prova /dev/spine, che mostra i tempi di ogni passaggio.
 */

export type SpinePreset = "original" | "enhanced" | "vivid";

export const SPINE_PRESETS: readonly SpinePreset[] = ["original", "enhanced", "vivid"];

export const DEFAULT_SPINE_PRESET: SpinePreset = "enhanced";

export interface EnhanceSettings {
  /** Peso della sfocatura 3×3 miscelata all'originale (0 = niente denoise). */
  denoiseMix: number;
  /** Quanto applicare il bilanciamento gray-world (0 = niente, 1 = pieno). */
  whiteBalance: number;
  /** Frazione di pixel tagliata a ciascun estremo negli auto-levels (0,01 = 1% / 99%). */
  levelsClip: number;
  /**
   * Limiti dello stiramento (0–255): il punto nero non sale oltre levelsMaxBlack e
   * il punto bianco non scende sotto levelsMinWhite. Una costola è quasi tutta del
   * suo colore: senza limiti il suo stesso corpo diventerebbe "nero".
   */
  levelsMaxBlack: number;
  levelsMinWhite: number;
  /**
   * La gamma correttiva scatta solo se la luminanza media della foto intera (0–1)
   * è sotto questa soglia: una costola marrone è scura di suo, non per poca luce.
   */
  gammaThreshold: number;
  /** Esponente minimo della gamma (schiarimento massimo). */
  gammaMin: number;
  /** Intensità della curva a S (0 = lineare). */
  contrast: number;
  /** Moltiplicatore della saturazione (1 = invariata). */
  saturation: number;
  /** Intensità dell'unsharp mask (0 = niente nitidezza). */
  sharpen: number;
}

/** null = "Originale": solo raddrizzamento, nessun miglioramento. */
export const PRESET_SETTINGS: Record<SpinePreset, EnhanceSettings | null> = {
  original: null,
  enhanced: {
    denoiseMix: 0.5,
    whiteBalance: 0.6,
    levelsClip: 0.01,
    levelsMaxBlack: 24,
    levelsMinWhite: 110,
    gammaThreshold: 0.35,
    gammaMin: 0.55,
    contrast: 0.25,
    saturation: 1.12,
    sharpen: 0.5,
  },
  vivid: {
    denoiseMix: 0.5,
    whiteBalance: 0.7,
    levelsClip: 0.015,
    levelsMaxBlack: 36,
    levelsMinWhite: 96,
    gammaThreshold: 0.4,
    gammaMin: 0.5,
    contrast: 0.45,
    saturation: 1.3,
    sharpen: 0.7,
  },
};

export const SPINE_PIPELINE = {
  /** Lato lungo massimo della foto dopo la decodifica (le foto da 12 MP sono ~4000 px). */
  maxInputSide: 2000,
  /** Altezza della costola raddrizzata (mai ingrandita oltre la risoluzione disponibile). */
  outputHeight: 1200,
  /** Sotto questa varianza del Laplaciano la foto è considerata sfocata. */
  blurThreshold: 60,
  /** Lato lungo della versione ridotta su cui si misura la nitidezza. */
  blurSampleSide: 512,
  /** Limite del bucket `spines`. */
  maxBytes: 512 * 1024,
  /** Qualità iniziale e minima della compressione; si scende a passi di qualityStep. */
  quality: 0.85,
  minQuality: 0.5,
  qualityStep: 0.1,
} as const;
