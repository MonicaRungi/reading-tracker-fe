import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import type { ShelfBook } from "@/api/shelves";
import { Spine } from "@/components/shared/Spine";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { cn } from "@/lib/utils";

/**
 * Costola sulla mensola. Un tap apre il libro, la pressione lunga solleva la
 * costola per spostarla. Niente transform di dnd-kit:
 * l'ordine cambia dal vivo e il layout a flusso sposta le costole; al posto
 * di quella trascinata resta un segnaposto tratteggiato (la copia segue il
 * dito nel DragOverlay). Da tastiera: Invio apre, Spazio sposta.
 */
export function SortableSpine({
  book,
  spineUrl,
  onPhotoError,
  onOpen,
}: {
  book: ShelfBook;
  spineUrl: string | undefined;
  onPhotoError: () => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: book.shelf_item_id,
  });
  const { title } = book.library_item.book;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onOpen();
      return;
    }
    listeners?.onKeyDown?.(event);
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onKeyDown={handleKeyDown}
      onClick={onOpen}
      aria-label={t("shelves.detail.openBook", { title })}
      aria-roledescription={t("shelves.reorder.roleDescription")}
      // una tirata verso il basso che parte da una costola è uno spostamento,
      // non un pull-to-refresh (che resta disponibile da header e parete)
      data-no-pull-refresh=""
      className={cn(
        // manipulation: prima dell'attivazione (pressione di 250 ms) lo scroll
        // resta nativo; touch-callout: niente menu di sistema alla pressione lunga su iOS
        "relative flex shrink-0 cursor-pointer touch-manipulation select-none items-end rounded-[3px] [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        !isDragging && "transition-transform active:-translate-y-1",
      )}
    >
      <Spine
        book={book.library_item.book}
        spine_url={spineUrl}
        spine_ratio={book.library_item.spine_ratio}
        height={SHELF_SPINE_HEIGHT}
        onPhotoError={onPhotoError}
        className={cn(isDragging && "invisible")}
      />
      {isDragging && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[3px] border-2 border-dashed border-(--shelf-placeholder)"
        />
      )}
    </div>
  );
}
