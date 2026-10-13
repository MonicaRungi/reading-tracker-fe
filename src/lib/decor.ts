import bookendUrl from "@/assets/decor/bookend.webp";
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
import owlUrl from "@/assets/decor/owl.webp";
import plantUrl from "@/assets/decor/plant.webp";
import quillUrl from "@/assets/decor/quill.webp";
import roseDomeUrl from "@/assets/decor/rose_dome.webp";
import polaroidsUrl from "@/assets/decor/polaroids.webp";
import rosesUrl from "@/assets/decor/roses.webp";
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
  { key: "eucalyptus", category: "plants", src: eucalyptusUrl, heightRatio: 0.77, aspect: 0.6655, overhang: 0 },
  { key: "dragon", category: "fantasy", src: dragonUrl, heightRatio: 0.5, aspect: 1.6015, overhang: 0 },
  { key: "star_jar", category: "fantasy", src: starJarUrl, heightRatio: 0.6, aspect: 0.8567, overhang: 0 },
  { key: "rose_dome", category: "fantasy", src: roseDomeUrl, heightRatio: 0.75, aspect: 0.725, overhang: 0.06 },
  { key: "cup", category: "fantasy", src: cupUrl, heightRatio: 0.6, aspect: 0.7497, overhang: 0.04 },
  { key: "crystal", category: "fantasy", src: crystalUrl, heightRatio: 0.65, aspect: 0.6057, overhang: 0.04 },
  { key: "dagger", category: "fantasy", src: daggerUrl, heightRatio: 1.078, aspect: 0.4313, overhang: 0.005 },
  { key: "chess", category: "fantasy", src: chessUrl, heightRatio: 0.6, aspect: 0.6302, overhang: 0 },
  { key: "roses", category: "romance", src: rosesUrl, heightRatio: 0.77, aspect: 0.855, overhang: 0.03 },
  { key: "candle_lilac", category: "romance", src: candleLilacUrl, heightRatio: 0.434, aspect: 0.951, overhang: 0.07 },
  { key: "candle_love", category: "romance", src: candleLoveUrl, heightRatio: 0.434, aspect: 0.9368, overhang: 0.07 },
  { key: "candle_hearts", category: "romance", src: candleHeartsUrl, heightRatio: 0.434, aspect: 0.8441, overhang: 0.07 },
  { key: "polaroids", category: "romance", src: polaroidsUrl, heightRatio: 1, aspect: 0.2441, overhang: 0, hanging: true },
  { key: "succulents", category: "plants", src: succulentsUrl, heightRatio: 0.5, aspect: 1.1142, overhang: 0 },
  { key: "candle", category: "vintage", src: candleUrl, heightRatio: 0.67, aspect: 0.7639, overhang: 0 },
  { key: "bust", category: "vintage", src: bustUrl, heightRatio: 0.9, aspect: 0.5395, overhang: 0 },
  { key: "quill", category: "vintage", src: quillUrl, heightRatio: 0.55, aspect: 0.6752, overhang: 0 },
  { key: "tea", category: "vintage", src: teaUrl, heightRatio: 0.4, aspect: 1.3792, overhang: 0 },
  { key: "globe", category: "vintage", src: globeUrl, heightRatio: 0.88, aspect: 0.671, overhang: 0.035 },
  { key: "bookend", category: "vintage", src: bookendUrl, heightRatio: 0.67, aspect: 0.8839, overhang: 0 },
  { key: "owl", category: "vintage", src: owlUrl, heightRatio: 0.67, aspect: 0.971, overhang: 0 },
];

/** Le sezioni con almeno una decorazione, ciascuna con le sue voci. */
export function decorSections(): { category: DecorCategory; items: DecorDefinition[] }[] {
  return DECOR_CATEGORIES.map((category) => ({
    category,
    items: DECOR_CATALOG.filter((decor) => decor.category === category),
  })).filter((section) => section.items.length > 0);
}

const BY_KEY = new Map(DECOR_CATALOG.map((decor) => [decor.key, decor]));

/** null per una chiave non (più) in catalogo: l'elemento resta nello scaffale ma non si disegna. */
export function decorByKey(key: string): DecorDefinition | null {
  return BY_KEY.get(key) ?? null;
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
