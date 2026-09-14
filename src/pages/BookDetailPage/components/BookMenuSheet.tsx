import { useTranslation } from "react-i18next";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MenuAction } from "./MenuAction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
      <SheetContent
        side="bottom"
        className="rounded-t-[22px] px-5 pb-safe pt-2"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-medium text-red-500 active:bg-[#F1EFEC]">
                {t("bookDetail.removeFromLibrary")}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("bookDetail.removeBookTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("bookDetail.removeBookConfirm")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {t("bookDetail.remove")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
