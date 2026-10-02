import type { SpineBook } from "@/api/shelves";

/**
 * Costola generata: aspetto deterministico a partire da `book.id`, così lo
 * stesso libro ha sempre la stessa costola su ogni scaffale e dispositivo.
 * Il colore non viene estratto dalla copertina: le immagini di Google Books /
 * Open Library sono cross-origin e "sporcano" il canvas.
 */

/** Altezza di riferimento: le larghezze qui sotto valgono a questa altezza. */
export const SPINE_BASE_HEIGHT = 160;

const MIN_WIDTH = 18;
const MAX_WIDTH = 44;
const DEFAULT_WIDTH = 26;
const MIN_PAGES = 80;
const MAX_PAGES = 900;
const HEIGHT_VARIATION = 0.08;

/** Tele e cuoi da rilegatura: toni caldi e smorzati, niente colori saturi. */
const PALETTE = [
  "#8c3b2e", // vinaccia
  "#b5543c", // terracotta
  "#c98b3a", // ocra
  "#e3c9a0", // sabbia
  "#5e6b3a", // oliva
  "#3f5a4c", // bosco
  "#2f4858", // ardesia
  "#4a3b5c", // prugna
  "#7a4e3a", // noce
  "#d9cfc1", // lino
  "#2b3a4a", // inchiostro
  "#b07c5f", // cammello
] as const;

const DARK_TEXT = "#1b1714";
const LIGHT_TEXT = "#fbf6ef";

export interface GeneratedSpine {
  background: string;
  foreground: string;
  /** Larghezza in px all'altezza `height` richiesta. */
  width: number;
  /** Altezza in px: `height` con una piccola variazione per libro. */
  height: number;
}

// FNV-1a a 32 bit: veloce e con una buona distribuzione anche su uuid simili.
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function baseWidth(pageCount: number | null): number {
  if (!pageCount || pageCount <= 0) return DEFAULT_WIDTH;
  const t = (pageCount - MIN_PAGES) / (MAX_PAGES - MIN_PAGES);
  return MIN_WIDTH + Math.min(1, Math.max(0, t)) * (MAX_WIDTH - MIN_WIDTH);
}

export function generatedSpine(
  book: Pick<SpineBook, "id" | "page_count">,
  height: number,
): GeneratedSpine {
  const h = hash(book.id);
  const background = PALETTE[h % PALETTE.length];
  // bit diversi dell'hash per altezza e colore, così non sono correlati
  const variation = (((h >>> 8) % 1000) / 1000) * 2 - 1;
  const scale = height / SPINE_BASE_HEIGHT;

  return {
    background,
    // soglia sul punto di uguale contrasto fra testo scuro e chiaro
    foreground: relativeLuminance(background) > 0.18 ? DARK_TEXT : LIGHT_TEXT,
    width: Math.round(baseWidth(book.page_count) * scale),
    height: Math.round(height * (1 + variation * HEIGHT_VARIATION)),
  };
}
