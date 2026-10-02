import { useTranslation } from "react-i18next";
import type { ShelfBook } from "@/api/shelves";
import { Spine } from "@/components/shared/Spine";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";

/** Una mensola: parete con le costole allineate in basso, poi la tavola. */
export function ShelfRow({
  books,
  onOpenBook,
}: {
  books: ShelfBook[];
  onOpenBook: (libraryItemId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-2 last:mb-0">
      {/* altezza fissa: la variazione ±8% delle costole non sposta le tavole */}
      <div className="flex h-[176px] items-end gap-[2px] rounded-t-md bg-(--shelf-back) px-3">
        {books.map(({ shelf_item_id, library_item }) => (
          <button
            key={shelf_item_id}
            type="button"
            onClick={() => onOpenBook(library_item.id)}
            aria-label={t("shelves.detail.openBook", { title: library_item.book.title })}
            className="shrink-0 rounded-[2px] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:-translate-y-1"
          >
            <Spine
              book={library_item.book}
              spine_ratio={library_item.spine_ratio}
              height={SHELF_SPINE_HEIGHT}
            />
          </button>
        ))}
      </div>
      <div className="h-2.5 border-b-4 border-(--shelf-board-edge) bg-(--shelf-board) shadow-[0_6px_8px_var(--shelf-board-shadow)]" />
    </div>
  );
}
