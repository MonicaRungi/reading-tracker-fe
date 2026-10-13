import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import type { ShelfDecor } from "@/api/shelves";
import type { DecorDefinition } from "@/lib/decor";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { cn } from "@/lib/utils";
import { DecorFace } from "./DecorFace";

/**
 * Decorazione sulla mensola: si sposta con la pressione lunga e si toglie
 * portandola sulla zona "rimuovi", come un libro. Sta sempre sul piano, non si
 * apre e non ha il cassetto delle posizioni. Da tastiera: Spazio la sposta.
 */
export function SortableDecor({ item, decor }: { item: ShelfDecor; decor: DecorDefinition }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: item.shelf_item_id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onContextMenu={(event) => event.preventDefault()}
      data-shelf-item-id={item.shelf_item_id}
      aria-label={t("shelves.decor.itemLabel", { name: t(`shelves.decor.items.${decor.key}`) })}
      aria-roledescription={t("shelves.decor.roleDescription")}
      // come per i libri: una tirata che parte da qui è uno spostamento, non un pull-to-refresh
      data-no-pull-refresh=""
      className={cn(
        "relative flex shrink-0 cursor-grab touch-manipulation select-none items-end rounded-[3px] [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        !isDragging && "transition-transform active:-translate-y-1",
      )}
    >
      <DecorFace decor={decor} spineHeight={SHELF_SPINE_HEIGHT} className={cn(isDragging && "invisible")} />
      {isDragging && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[3px] border-2 border-dashed border-(--shelf-placeholder)"
        />
      )}
    </div>
  );
}
