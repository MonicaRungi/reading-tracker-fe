import type { ShelfBook, ShelfDecor, ShelfEntry, ShelfItemDisplay } from "@/api/shelves";
import { decorByKey, decorSize } from "@/lib/decor";
import { spineSize } from "@/lib/spine/size";

/** Copertina di fronte: proporzioni di un libro (2:3). */
const COVER_RATIO = 2 / 3;
/** Spazio fra due libri sdraiati nella stessa pila. */
export const STACK_GAP = 1;

export interface BookFaceSize {
  width: number;
  height: number;
}

/**
 * Ingombro di un libro sulla mensola, secondo come sta: in piedi (il dorso),
 * sdraiato (il dorso girato: lungo quanto il libro è alto, spesso quanto il
 * dorso è largo) o di fronte (la copertina, alta quanto un dorso in piedi).
 */
export function bookFaceSize(book: ShelfBook, height: number): BookFaceSize {
  const spine = spineSize(book.library_item, height);
  switch (book.display) {
    case "stack":
      return { width: spine.height, height: spine.width };
    case "cover":
      return { width: Math.round(height * COVER_RATIO), height };
    default:
      return spine;
  }
}

/** Un blocco di libri: uno in piedi, una copertina o una pila di sdraiati. */
export interface ShelfBookUnit {
  /** Stabile finché il primo libro del blocco non cambia. */
  key: string;
  kind: ShelfItemDisplay;
  /** Per le pile, dal basso verso l'alto (lo stesso ordine dello scaffale). */
  books: ShelfBook[];
  width: number;
  height: number;
}

/** Una decorazione: blocco a sé sul piano, interrompe le pile. */
export interface ShelfDecorUnit {
  key: string;
  kind: "decor";
  decor: ShelfDecor;
  width: number;
  height: number;
}

export type ShelfUnit = ShelfBookUnit | ShelfDecorUnit;

/**
 * Raggruppa gli elementi in blocchi nell'ordine dello scaffale. I sdraiati
 * consecutivi formano una pila, che non supera `maxStackHeight`: oltre, ne
 * comincia un'altra accanto. Il riordino resta sull'elenco piatto degli
 * elementi: le pile si ricompongono da sole. Le decorazioni stanno sul piano
 * e interrompono le pile; quelle fuori catalogo non si disegnano (restano
 * nello scaffale e nell'ordine).
 */
export function buildShelfUnits(
  entries: readonly ShelfEntry[],
  height: number,
  maxStackHeight: number,
): ShelfUnit[] {
  const units: ShelfUnit[] = [];
  let stack: ShelfBookUnit | null = null;

  for (const entry of entries) {
    if (entry.item_type === "decor") {
      stack = null;
      const decor = decorByKey(entry.decor_key);
      if (!decor) continue;
      const size = decorSize(decor, height);
      units.push({ key: entry.shelf_item_id, kind: "decor", decor: entry, width: size.width, height: size.height });
      continue;
    }
    const book = entry;
    const size = bookFaceSize(book, height);
    if (book.display !== "stack") {
      stack = null;
      units.push({ key: book.shelf_item_id, kind: book.display, books: [book], ...size });
      continue;
    }
    const grown = stack ? stack.height + STACK_GAP + size.height : size.height;
    if (stack && grown <= maxStackHeight) {
      stack.books.push(book);
      stack.height = grown;
      stack.width = Math.max(stack.width, size.width);
    } else {
      stack = { key: book.shelf_item_id, kind: "stack", books: [book], ...size };
      units.push(stack);
    }
  }
  return units;
}
