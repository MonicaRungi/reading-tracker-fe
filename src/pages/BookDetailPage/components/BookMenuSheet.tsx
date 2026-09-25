import { useTranslation } from "react-i18next";
import { Sheet } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { MenuAction } from "./MenuAction";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";

export function BookMenuSheet({
  open,
  status,
  onOpenChange,
  onMarkAbandoned,
  onResetToToRead,
  onDelete,
}: {
  open: boolean;
  status: string;
  onOpenChange: (open: boolean) => void;
  onMarkAbandoned: () => void;
  onResetToToRead: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        className="px-5"
      >
        <div className="space-y-1 pb-4">
          {status !== "abandoned" && status !== "read" && (
            <MenuAction
              label={t("bookDetail.markAbandoned")}
              onClick={onMarkAbandoned}
            />
          )}
          {status !== "to_read" && (
            <MenuAction
              label={t("bookDetail.resetToToRead")}
              onClick={onResetToToRead}
            />
          )}
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium text-destructive hover:text-destructive active:bg-secondary"
              >
                {t("bookDetail.removeFromLibrary")}
              </Button>
            }
            title={t("bookDetail.removeBookTitle")}
            description={t("bookDetail.removeBookConfirm")}
            confirmLabel={t("bookDetail.remove")}
            onConfirm={onDelete}
          />
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
