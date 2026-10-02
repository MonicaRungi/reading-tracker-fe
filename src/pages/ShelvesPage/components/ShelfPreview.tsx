import type { ShelfBook, ShelfTheme } from "@/api/shelves";
import { Spine } from "@/components/shared/Spine";

const PREVIEW_SPINE_HEIGHT = 64;

/** Mini-mensola dell'elenco: una sola riga, i libri in eccesso si tagliano. */
export function ShelfPreview({
  theme,
  books,
}: {
  theme: ShelfTheme;
  books: ShelfBook[];
}) {
  return (
    <div data-shelf-theme={theme} className="bg-(--shelf-bg) px-2 pt-2">
      <div className="flex h-[78px] items-end gap-[2px] overflow-hidden rounded-t-md bg-(--shelf-back) px-2.5">
        {books.map(({ shelf_item_id, library_item }) => (
          <Spine
            key={shelf_item_id}
            book={library_item.book}
            spine_ratio={library_item.spine_ratio}
            height={PREVIEW_SPINE_HEIGHT}
          />
        ))}
      </div>
      <div className="h-2 border-b-[3px] border-(--shelf-board-edge) bg-(--shelf-board) shadow-[0_4px_6px_var(--shelf-board-shadow)]" />
      <div className="h-2" />
    </div>
  );
}
