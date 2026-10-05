import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDroppable } from "@dnd-kit/core";
import { SHELF_REMOVE_ZONE_ID } from "@/lib/shelfLayout";
import { cn } from "@/lib/utils";

/**
 * Zona in fondo al mobile, visibile solo durante il trascinamento: rilasciando
 * qui il libro esce dallo scaffale (resta in libreria, con "Annulla").
 */
export function RemoveDropZone() {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: SHELF_REMOVE_ZONE_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-5 text-[14px] font-medium backdrop-blur-sm transition-colors",
        isOver
          ? "border-destructive bg-destructive/80 text-white"
          : "border-destructive/70 bg-destructive/20 text-destructive",
      )}
    >
      <Trash2 className="size-5" aria-hidden="true" />
      {t("shelves.reorder.removeZone")}
    </div>
  );
}
