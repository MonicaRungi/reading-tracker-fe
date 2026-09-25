import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ArchiveGoalDialog({
  goal,
  isArchiving,
  onConfirm,
  onCancel,
}: {
  goal: ReadingGoal | null;
  isArchiving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={!!goal} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("goals.detail.archiveTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("goals.detail.archiveDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isArchiving}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {t("goals.detail.archiveConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
