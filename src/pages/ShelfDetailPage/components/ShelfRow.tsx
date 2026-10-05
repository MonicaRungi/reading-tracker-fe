import type { SpineUrls } from "@/api/spines";
import { STACK_GAP } from "@/lib/shelfUnits";
import type { ShelfUnit } from "@/lib/shelfUnits";
import { SortableBook } from "./SortableBook";

/**
 * Una mensola: i blocchi (libri in piedi, copertine, pile di sdraiati)
 * allineati in basso, poi il piano. Nelle pile il primo libro sta sotto.
 */
export function ShelfRow({
  units,
  spineUrls,
  onPhotoError,
  onOpenBook,
  onOpenMenu,
}: {
  units: ShelfUnit[];
  spineUrls: SpineUrls;
  onPhotoError: () => void;
  onOpenBook: (libraryItemId: string) => void;
  onOpenMenu: (book: ShelfUnit["books"][number]) => void;
}) {
  const renderBook = (book: ShelfUnit["books"][number]) => (
    <SortableBook
      key={book.shelf_item_id}
      book={book}
      spineUrl={book.library_item.spine_path ? spineUrls[book.library_item.spine_path] : undefined}
      onPhotoError={onPhotoError}
      onOpen={() => onOpenBook(book.library_item.id)}
      onOpenMenu={() => onOpenMenu(book)}
    />
  );

  return (
    <div className="min-w-0 shrink-0">
      {/* altezza minima fissa: la variazione ±8% dei dorsi non sposta i piani */}
      <div className="shelf-books">
        {units.map((unit) =>
          unit.kind === "stack" ? (
            <div
              key={unit.key}
              className="flex shrink-0 flex-col-reverse items-center"
              style={{ width: unit.width, gap: STACK_GAP }}
            >
              {unit.books.map(renderBook)}
            </div>
          ) : (
            renderBook(unit.books[0])
          ),
        )}
      </div>
      <div className="shelf-plank" />
    </div>
  );
}
