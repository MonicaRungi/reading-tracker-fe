import type { ShelfBook, ShelfItemDisplay } from "@/api/shelves";
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

/** Un blocco della mensola: un libro in piedi, una copertina o una pila di sdraiati. */
export interface ShelfUnit {
  /** Stabile finché il primo libro del blocco non cambia. */
  key: string;
  kind: ShelfItemDisplay;
  /** Per le pile, dal basso verso l'alto (lo stesso ordine dello scaffale). */
  books: ShelfBook[];
  width: number;
  height: number;
}

/**
 * Raggruppa i libri in blocchi nell'ordine dello scaffale. I sdraiati
 * consecutivi formano una pila, che non supera `maxStackHeight`: oltre, ne
 * comincia un'altra accanto. Il riordino resta sull'elenco piatto dei libri:
 * le pile si ricompongono da sole.
 */
export function buildShelfUnits(
  books: readonly ShelfBook[],
  height: number,
  maxStackHeight: number,
): ShelfUnit[] {
  const units: ShelfUnit[] = [];
  let stack: ShelfUnit | null = null;

  for (const book of books) {
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
