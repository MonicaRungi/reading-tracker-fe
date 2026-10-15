import bookendCatLeftUrl from "@/assets/decor/bookend_cat_left.webp";
import bookendDragonBlueUrl from "@/assets/decor/bookend_dragon_blue.webp";
import bookendDragonDarkUrl from "@/assets/decor/bookend_dragon_dark.webp";
import bookendIvyLeftUrl from "@/assets/decor/bookend_ivy_left.webp";
import bookendIvyRightUrl from "@/assets/decor/bookend_ivy_right.webp";
import bookendLovebirdLeftUrl from "@/assets/decor/bookend_lovebird_left.webp";
import bookendLovebirdRightUrl from "@/assets/decor/bookend_lovebird_right.webp";
import bookendOwlRightUrl from "@/assets/decor/bookend_owl_right.webp";
import bustUrl from "@/assets/decor/bust.webp";
import cactusUrl from "@/assets/decor/cactus.webp";
import candleUrl from "@/assets/decor/candle.webp";
import candleHeartsUrl from "@/assets/decor/candle_hearts.webp";
import candleLilacUrl from "@/assets/decor/candle_lilac.webp";
import candleLoveUrl from "@/assets/decor/candle_love.webp";
import chessUrl from "@/assets/decor/chess.webp";
import crystalUrl from "@/assets/decor/crystal.webp";
import cupUrl from "@/assets/decor/cup.webp";
import daggerUrl from "@/assets/decor/dagger.webp";
import dragonUrl from "@/assets/decor/dragon.webp";
import eucalyptusUrl from "@/assets/decor/eucalyptus.webp";
import globeUrl from "@/assets/decor/globe.webp";
import plantUrl from "@/assets/decor/plant.webp";
import quillUrl from "@/assets/decor/quill.webp";
import roseDomeUrl from "@/assets/decor/rose_dome.webp";
import polaroidsUrl from "@/assets/decor/polaroids.webp";
import rosesUrl from "@/assets/decor/roses.webp";
import seraphBladeUrl from "@/assets/decor/seraph_blade.webp";
import starJarUrl from "@/assets/decor/star_jar.webp";
import succulentsUrl from "@/assets/decor/succulents.webp";
import teaUrl from "@/assets/decor/tea.webp";

import { SHELF_ROW_GAP, shelfRowHeight } from "@/lib/shelfLayout";

/**
 * Catalogo delle decorazioni della mensola. La chiave è `shelf_items.decor_key`
 * nel DB: non va mai rinominata (gli scaffali salvati la usano).
 * Le immagini (WebP con trasparenza, a 3× l'altezza a schermo) sono preparate
 * a mano: margini tagliati, aloni dello scontorno ripuliti.
 */
/** Sezioni del catalogo, nell'ordine dello sheet. */
export const DECOR_CATEGORIES = ["vintage", "plants", "fantasy", "romance"] as const;
export type DecorCategory = (typeof DECOR_CATEGORIES)[number];

export interface DecorDefinition {
  key: string;
  category: DecorCategory;
  src: string;
  /** Altezza a schermo dell'oggetto appoggiato, rispetto a un dorso in piedi (1 = alto come un libro). */
  heightRatio: number;
  /**
   * Appesa (es. un filo di polaroid): dal piano di sopra a quello sotto, con il
   * filo che parte dal bordo alto dell'immagine. Ignora `heightRatio` e `overhang`.
   */
  hanging?: boolean;
  /** Larghezza / altezza dell'immagine intera. */
  aspect: number;
  /**
   * Quota dell'immagine sotto la base d'appoggio: sporge davanti al bordo del
   * piano. Serve per le foglie che ricadono oltre il fondo del vaso e per le
   * basi rotonde viste dall'alto (il bordo anteriore scende sul piano, se no
   * l'oggetto sembra sospeso).
   */
  overhang: number;
}

export const DECOR_CATALOG: readonly DecorDefinition[] = [
  { key: "plant", category: "plants", src: plantUrl, heightRatio: 0.87, aspect: 1.1685, overhang: 0.0299 },
  { key: "cactus", category: "plants", src: cactusUrl, heightRatio: 0.6, aspect: 0.5905, overhang: 0 },
  { key: "eucalyptus", category: "plants", src: eucalyptusUrl, heightRatio: 0.67, aspect: 0.6655, overhang: 0.01 },
  { key: "dragon", category: "fantasy", src: dragonUrl, heightRatio: 0.3, aspect: 1.7779, overhang: 0.17 },
  { key: "star_jar", category: "fantasy", src: starJarUrl, heightRatio: 0.6, aspect: 0.8567, overhang: 0 },
  { key: "rose_dome", category: "fantasy", src: roseDomeUrl, heightRatio: 0.75, aspect: 0.725, overhang: 0.06 },
  { key: "cup", category: "fantasy", src: cupUrl, heightRatio: 0.62, aspect: 1.0535, overhang: 0 },
  { key: "crystal", category: "fantasy", src: crystalUrl, heightRatio: 0.35, aspect: 1.6796, overhang: 0 },
  { key: "dagger", category: "fantasy", src: daggerUrl, heightRatio: 0.44, aspect: 2.5779, overhang: 0 },
  { key: "seraph_blade", category: "fantasy", src: seraphBladeUrl, heightRatio: 0.533, aspect: 3.3884, overhang: 0 },
  { key: "chess", category: "fantasy", src: chessUrl, heightRatio: 0.6, aspect: 0.6302, overhang: 0 },
  { key: "roses", category: "romance", src: rosesUrl, heightRatio: 0.87, aspect: 0.855, overhang: 0.02 },
  { key: "candle_lilac", category: "romance", src: candleLilacUrl, heightRatio: 0.33, aspect: 0.951, overhang: 0.08 },
  { key: "candle_love", category: "romance", src: candleLoveUrl, heightRatio: 0.33, aspect: 0.951, overhang: 0.09 },
  { key: "candle_hearts", category: "romance", src: candleHeartsUrl, heightRatio: 0.33, aspect: 0.951, overhang: 0.06 },
  { key: "polaroids", category: "romance", src: polaroidsUrl, heightRatio: 1, aspect: 0.2441, overhang: 0, hanging: true },
  { key: "succulents", category: "plants", src: succulentsUrl, heightRatio: 0.45, aspect: 1.1142, overhang: 0.03 },
  { key: "candle", category: "vintage", src: candleUrl, heightRatio: 0.45, aspect: 0.7639, overhang: 0.03 },
  { key: "bust", category: "vintage", src: bustUrl, heightRatio: 0.9, aspect: 0.5395, overhang: 0.02 },
  { key: "quill", category: "vintage", src: quillUrl, heightRatio: 0.45, aspect: 0.6752, overhang: 0.03 },
  { key: "tea", category: "vintage", src: teaUrl, heightRatio: 0.25, aspect: 1.3792, overhang: 0.03 },
  { key: "globe", category: "vintage", src: globeUrl, heightRatio: 0.88, aspect: 0.671, overhang: 0.035 },
  // fermalibri a coppie: "_right" ha la lastra a destra (va a inizio fila), "_left" a sinistra (a fine fila)
  { key: "bookend_ivy_right", category: "plants", src: bookendIvyRightUrl, heightRatio: 0.67, aspect: 0.6836, overhang: 0.166 },
  { key: "bookend_ivy_left", category: "plants", src: bookendIvyLeftUrl, heightRatio: 0.67, aspect: 0.7559, overhang: 0.1673 },
  { key: "bookend_dragon_dark", category: "fantasy", src: bookendDragonDarkUrl, heightRatio: 0.8, aspect: 1.1098, overhang: 0 },
  { key: "bookend_dragon_blue", category: "fantasy", src: bookendDragonBlueUrl, heightRatio: 0.8, aspect: 1.0015, overhang: 0 },
  { key: "bookend_lovebird_right", category: "romance", src: bookendLovebirdRightUrl, heightRatio: 0.67, aspect: 0.8717, overhang: 0 },
  { key: "bookend_lovebird_left", category: "romance", src: bookendLovebirdLeftUrl, heightRatio: 0.67, aspect: 0.788, overhang: 0 },
  { key: "bookend_cat_left", category: "vintage", src: bookendCatLeftUrl, heightRatio: 0.67, aspect: 0.8839, overhang: 0 },
  { key: "bookend_owl_right", category: "vintage", src: bookendOwlRightUrl, heightRatio: 0.67, aspect: 0.971, overhang: 0 },
];

/** Le sezioni con almeno una decorazione, ciascuna con le sue voci. */
export function decorSections(): { category: DecorCategory; items: DecorDefinition[] }[] {
  return DECOR_CATEGORIES.map((category) => ({
    category,
    items: DECOR_CATALOG.filter((decor) => decor.category === category),
  })).filter((section) => section.items.length > 0);
}

const BY_KEY = new Map(DECOR_CATALOG.map((decor) => [decor.key, decor]));

/**
 * Chiavi rinominate: quelle vecchie restano valide per gli scaffali salvati
 * prima della migrazione `rename_bookend_decor_keys` (che le aggiorna nel DB).
 */
const LEGACY_KEYS: Record<string, string> = {
  bookend: "bookend_cat_left",
  owl: "bookend_owl_right",
};

/** null per una chiave non (più) in catalogo: l'elemento resta nello scaffale ma non si disegna. */
export function decorByKey(key: string): DecorDefinition | null {
  return BY_KEY.get(LEGACY_KEYS[key] ?? key) ?? null;
}

/**
 * Ingombro a schermo dell'immagine intera, per un dorso di riferimento alto
 * `spineHeight`. `rise` è quanto l'immagine sale oltre la riga senza occupare
 * spazio (le appese attraversano lo spazio fra le righe fino al piano di sopra).
 */
export function decorSize(decor: DecorDefinition, spineHeight: number) {
  if (decor.hanging) {
    const height = shelfRowHeight() + SHELF_ROW_GAP;
    return { width: Math.round(height * decor.aspect), height, overhang: 0, rise: SHELF_ROW_GAP };
  }
  // l'altezza "appoggiata" esclude la parte che sporge sotto la base
  const height = Math.round((spineHeight * decor.heightRatio) / (1 - decor.overhang));
  return {
    width: Math.round(height * decor.aspect),
    height,
    overhang: Math.round(height * decor.overhang),
    rise: 0,
  };
}
