import { useMemo } from "react";
import type { ShelfBook, ShelfTheme } from "@/api/shelves";
import { useElementWidth } from "@/hooks/useElementWidth";
import {
  layoutShelfRows,
  SHELF_SPINE_GAP,
  SHELF_SPINE_HEIGHT,
  shelfRowInset,
} from "@/lib/shelfLayout";
import { spineSize } from "@/lib/spine/size";
import { cn } from "@/lib/utils";
import { ShelfRow } from "./ShelfRow";

/**
 * Mensola a flusso: le costole riempiono una riga finché c'è spazio, poi si
 * passa alla mensola successiva. La larghezza disponibile è misurata sul
 * mobile, quindi il layout si adatta a rotazione e resize.
 */
export function ShelfBoard({
  theme,
  books,
  onOpenBook,
  className,
}: {
  theme: ShelfTheme;
  books: ShelfBook[];
  onOpenBook: (libraryItemId: string) => void;
  className?: string;
}) {
  // contentRect esclude il padding della parete: resta da togliere quello delle righe
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const rows = useMemo(() => {
    const available = width - 2 * shelfRowInset();
    if (available <= 0) return [];
    return layoutShelfRows(
      books,
      (book) => spineSize(book.library_item, SHELF_SPINE_HEIGHT).width,
      available,
      SHELF_SPINE_GAP,
    );
  }, [books, width]);

  // la cornice resta ferma; dentro scorre la parete con le mensole
  return (
    <div data-shelf-theme={theme} className={cn("shelf-frame", className)}>
      <div
        ref={ref}
        // scroll proprio: il pull-to-refresh parte solo se è in cima
        data-scroll-area=""
        className="shelf-board shelf-wall min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {rows.map((row) => (
          <ShelfRow key={row[0].shelf_item_id} books={row} onOpenBook={onOpenBook} />
        ))}
      </div>
    </div>
  );
}
