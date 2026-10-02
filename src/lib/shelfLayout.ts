/** Altezza delle costole sulla mensola del dettaglio scaffale. */
export const SHELF_SPINE_HEIGHT = 150;

/** Spazio fra costole adiacenti: deve combaciare con `gap-[2px]` di ShelfRow. */
export const SHELF_SPINE_GAP = 2;

/**
 * Disposizione a flusso della mensola: riempie una riga finché c'è spazio,
 * poi passa alla successiva. Ogni riga ha almeno un elemento, anche se più
 * largo del contenitore (non succede con le costole, ma evita righe vuote).
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
