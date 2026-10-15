import { Pencil, Share, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { MenuAction } from "@/components/shared/MenuAction";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

/** Menu ⋯ di uno scaffale: condividi (solo nel dettaglio), modifica nome/tema, elimina. */
export function ShelfMenuSheet({
  shelfName,
  onShare,
  onEdit,
  onDelete,
  onClose,
}: {
  /** null = menu chiuso. */
  shelfName: string | null;
  /** Assente = voce nascosta (nell'elenco i libri dello scaffale non sono caricati). */
  onShare?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={shelfName !== null} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent className="px-5">
        <SheetTitle className="truncate px-4 pb-2 pr-8 text-[17px] font-bold text-foreground">
          {shelfName}
        </SheetTitle>
        <div className="space-y-1 pb-4">
          {onShare && <MenuAction icon={Share} label={t("shelves.menu.share")} onClick={onShare} />}
          <MenuAction icon={Pencil} label={t("shelves.menu.edit")} onClick={onEdit} />
          <MenuAction icon={Trash2} tone="destructive" label={t("shelves.menu.delete")} onClick={onDelete} />
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
