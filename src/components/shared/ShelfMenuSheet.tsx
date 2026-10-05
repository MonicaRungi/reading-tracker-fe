import { useTranslation } from "react-i18next";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { MenuAction } from "@/components/shared/MenuAction";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

/** Menu ⋯ di uno scaffale: modifica nome/tema, elimina. */
export function ShelfMenuSheet({
  shelfName,
  onEdit,
  onDelete,
  onClose,
}: {
  /** null = menu chiuso. */
  shelfName: string | null;
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
          <MenuAction label={t("shelves.menu.edit")} onClick={onEdit} />
          <Button
            variant="ghost"
            onClick={onDelete}
            className="h-auto w-full justify-start rounded-xl px-4 py-3.5 text-left text-[15px] font-medium text-destructive hover:text-destructive active:bg-secondary"
          >
            {t("shelves.menu.delete")}
          </Button>
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
