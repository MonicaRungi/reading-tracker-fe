import type { ShelfBook, ShelfDecor } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { decorByKey } from "@/lib/decor";
import { cn } from "@/lib/utils";
import { STACK_GAP } from "@/lib/shelfUnits";
import type { ShelfUnit } from "@/lib/shelfUnits";
import { SortableBook } from "./SortableBook";
import { SortableDecor } from "./SortableDecor";

/**
 * Una mensola: i blocchi (libri in piedi, copertine, pile di sdraiati,
 * decorazioni) allineati in basso, poi il piano. Nelle pile il primo libro sta
 * sotto. Le righe chiuse sono centrate; l'ultima, ancora da riempire, a sinistra.
 */
export function ShelfRow({
  units,
  isFull,
  spineUrls,
  onPhotoError,
  onOpenBook,
  onOpenMenu,
}: {
  units: ShelfUnit[];
  /** Riga chiusa (il blocco successivo è andato a capo): i blocchi si centrano. */
  isFull: boolean;
  spineUrls: SpineUrls;
  onPhotoError: () => void;
  onOpenBook: (libraryItemId: string) => void;
  onOpenMenu: (book: ShelfBook) => void;
}) {
  const renderDecor = (item: ShelfDecor) => {
    const decor = decorByKey(item.decor_key);
    return decor ? <SortableDecor key={item.shelf_item_id} item={item} decor={decor} /> : null;
  };

  const renderBook = (book: ShelfBook) => (
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
      <div className={cn("shelf-books", isFull && "justify-center")}>
        {units.map((unit) => {
          if (unit.kind === "decor") return renderDecor(unit.decor);
          return unit.kind === "stack" ? (
            <div
              key={unit.key}
              className="flex shrink-0 flex-col-reverse items-center"
              style={{ width: unit.width, gap: STACK_GAP }}
            >
              {unit.books.map(renderBook)}
            </div>
          ) : (
            renderBook(unit.books[0])
          );
        })}
      </div>
      <div className="shelf-plank" />
    </div>
  );
}
