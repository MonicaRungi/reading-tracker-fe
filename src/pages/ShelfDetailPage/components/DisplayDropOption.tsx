import { useTranslation } from "react-i18next";
import { useDroppable } from "@dnd-kit/core";
import type { ShelfItemDisplay } from "@/api/shelves";
import { displayDropId } from "@/lib/shelfLayout";
import { cn } from "@/lib/utils";
import { DisplayIcon } from "./DisplayIcon";

/** Una posizione nel cassetto: zona di rilascio per il libro trascinato. */
export function DisplayDropOption({
  display,
  isCurrent,
}: {
  display: ShelfItemDisplay;
  isCurrent: boolean;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: displayDropId(display) });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 rounded-xl px-1 text-center text-[12px] font-medium text-foreground transition-colors",
        isCurrent && "bg-accent/70 text-primary",
        isOver && "bg-accent text-primary ring-2 ring-primary",
      )}
    >
      <span className={cn("transition-transform", isOver && "scale-125")}>
        <DisplayIcon display={display} />
      </span>
      {t(`shelves.display.options.${display}`)}
    </div>
  );
}
