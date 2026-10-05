/** Altezza dei dorsi sulla mensola del dettaglio scaffale. */
export const SHELF_SPINE_HEIGHT = 150;

/**
 * Altezza massima di una pila di libri sdraiati: quella di un dorso in piedi
 * (oltre, la pila uscirebbe dalla riga e ne comincia un'altra accanto).
 */
export const SHELF_STACK_MAX_HEIGHT = SHELF_SPINE_HEIGHT;

/** Spazio fra dorsi adiacenti: deve combaciare con il gap di `shelf-books` (index.css). */
export const SHELF_SPINE_GAP = 2;

/** Id della zona "Trascina qui per rimuovere" fra i droppable di dnd-kit. */
export const SHELF_REMOVE_ZONE_ID = "shelf-remove-zone";

/** Id della linguetta a destra che apre il cassetto delle posizioni durante il trascinamento. */
export const SHELF_DISPLAY_TAB_ID = "shelf-display-tab";

const DISPLAY_DROP_PREFIX = "shelf-display:";

/** Id della zona di rilascio di una posizione nel cassetto ("In verticale", ecc.). */
export function displayDropId(display: string): string {
  return DISPLAY_DROP_PREFIX + display;
}

/** La posizione di una zona del cassetto, o null se l'id non è una zona del cassetto. */
export function displayFromDropId(id: string | number | undefined): string | null {
  return typeof id === "string" && id.startsWith(DISPLAY_DROP_PREFIX)
    ? id.slice(DISPLAY_DROP_PREFIX.length)
    : null;
}

/** Stesso breakpoint dei media query di `shelf-books` / `shelf-board`. */
const MOBILE_QUERY = "(width < 40rem)";

/**
 * Padding orizzontale di una riga (`shelf-books` in index.css): lo spazio utile
 * per i dorsi è la larghezza interna del mobile meno questo valore per lato.
 */
export function shelfRowInset(): number {
  return window.matchMedia(MOBILE_QUERY).matches ? 6 : 12;
}

/**
 * Disposizione a flusso della mensola: riempie una riga finché c'è spazio,
 * poi passa alla successiva. Ogni riga ha almeno un elemento, anche se più
 * largo del contenitore (non succede con i dorsi, ma evita righe vuote).
 */
export function layoutShelfRows<T>(
  items: readonly T[],
  widthOf: (item: T) => number,
  containerWidth: number,
  gap: number,
): T[][] {
  const rows: T[][] = [];
  let row: T[] = [];
  let used = 0;

  for (const item of items) {
    const width = widthOf(item);
    const needed = row.length === 0 ? width : used + gap + width;
    if (row.length > 0 && needed > containerWidth) {
      rows.push(row);
      row = [item];
      used = width;
    } else {
      row.push(item);
      used = needed;
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}
