import { useMemo } from "react";
import type { ShelfBook, ShelfTheme } from "@/api/shelves";
import { useElementWidth } from "@/hooks/useElementWidth";
import { layoutShelfRows, SHELF_SPINE_GAP, SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { spineSize } from "@/lib/spine/size";
import { ShelfRow } from "./ShelfRow";

/**
 * Mensola a flusso: le costole riempiono una riga finché c'è spazio, poi si
 * passa alla mensola successiva. La larghezza disponibile è misurata sul
 * contenitore, quindi il layout si adatta a rotazione e resize.
 */
export function ShelfBoard({
  theme,
  books,
  onOpenBook,
}: {
  theme: ShelfTheme;
  books: ShelfBook[];
  onOpenBook: (libraryItemId: string) => void;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const rows = useMemo(
    () =>
      width > 0
        ? layoutShelfRows(
            books,
            (book) => spineSize(book.library_item, SHELF_SPINE_HEIGHT).width,
            width,
            SHELF_SPINE_GAP,
          )
        : [],
    [books, width],
  );

  return (
    <div data-shelf-theme={theme} className="rounded-2xl bg-(--shelf-bg) p-2 shadow-card">
      {/* il ref misura l'area utile della riga: padding orizzontale della parete escluso */}
      <div className="px-3">
        <div ref={ref} className="h-0" />
      </div>
      {rows.map((row) => (
        <ShelfRow key={row[0].shelf_item_id} books={row} onOpenBook={onOpenBook} />
      ))}
    </div>
  );
}
