import { useTranslation } from "react-i18next";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MenuAction } from "./MenuAction";

export function BookMenuSheet({
  open,
  status,
  onOpenChange,
  onMarkAbandoned,
  onResetToToRead,
}: {
  open: boolean;
  status: string;
  onOpenChange: (open: boolean) => void;
  onMarkAbandoned: () => void;
  onResetToToRead: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[22px] px-5 pb-safe pt-2">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
        <div className="space-y-1 pb-4">
          {status !== "abandoned" && status !== "read" && (
            <MenuAction label={t("bookDetail.markAbandoned")} onClick={onMarkAbandoned} />
          )}
          {status !== "to_read" && (
            <MenuAction label={t("bookDetail.resetToToRead")} onClick={onResetToToRead} />
          )}
          <MenuAction
            label={t("common.cancel")}
            tone="primary"
            onClick={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
