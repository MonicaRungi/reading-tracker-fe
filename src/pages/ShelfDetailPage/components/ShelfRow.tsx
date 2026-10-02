import { useTranslation } from "react-i18next";
import type { ShelfBook } from "@/api/shelves";
import { Spine } from "@/components/shared/Spine";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";

/** Una mensola: costole allineate in basso, poi il piano. */
export function ShelfRow({
  books,
  onOpenBook,
}: {
  books: ShelfBook[];
  onOpenBook: (libraryItemId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 shrink-0">
      {/* altezza minima fissa: la variazione ±8% delle costole non sposta i piani */}
      <div className="shelf-books">
        {books.map(({ shelf_item_id, library_item }) => (
          <button
            key={shelf_item_id}
            type="button"
            onClick={() => onOpenBook(library_item.id)}
            aria-label={t("shelves.detail.openBook", { title: library_item.book.title })}
            className="flex shrink-0 items-end rounded-[3px] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:-translate-y-1"
          >
            <Spine
              book={library_item.book}
              spine_ratio={library_item.spine_ratio}
              height={SHELF_SPINE_HEIGHT}
            />
          </button>
        ))}
      </div>
      <div className="shelf-plank" />
    </div>
  );
}
