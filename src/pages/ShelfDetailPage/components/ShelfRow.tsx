import type { ShelfBook } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { SortableSpine } from "./SortableSpine";

/** Una mensola: dorsi allineati in basso, poi il piano. */
export function ShelfRow({
  books,
  spineUrls,
  onPhotoError,
  onOpenBook,
}: {
  books: ShelfBook[];
  spineUrls: SpineUrls;
  onPhotoError: () => void;
  onOpenBook: (libraryItemId: string) => void;
}) {
  return (
    <div className="min-w-0 shrink-0">
      {/* altezza minima fissa: la variazione ±8% dei dorsi non sposta i piani */}
      <div className="shelf-books">
        {books.map((book) => (
          <SortableSpine
            key={book.shelf_item_id}
            book={book}
            spineUrl={book.library_item.spine_path ? spineUrls[book.library_item.spine_path] : undefined}
            onPhotoError={onPhotoError}
            onOpen={() => onOpenBook(book.library_item.id)}
          />
        ))}
      </div>
      <div className="shelf-plank" />
    </div>
  );
}
