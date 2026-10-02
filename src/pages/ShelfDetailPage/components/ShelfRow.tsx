import type { ShelfBook } from "@/api/shelves";
import { SortableSpine } from "./SortableSpine";

/** Una mensola: costole allineate in basso, poi il piano. */
export function ShelfRow({
  books,
  onOpenBook,
}: {
  books: ShelfBook[];
  onOpenBook: (libraryItemId: string) => void;
}) {
  return (
    <div className="min-w-0 shrink-0">
      {/* altezza minima fissa: la variazione ±8% delle costole non sposta i piani */}
      <div className="shelf-books">
        {books.map((book) => (
          <SortableSpine
            key={book.shelf_item_id}
            book={book}
            onOpen={() => onOpenBook(book.library_item.id)}
          />
        ))}
      </div>
      <div className="shelf-plank" />
    </div>
  );
}
