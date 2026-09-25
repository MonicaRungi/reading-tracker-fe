import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { SecondaryGoalIcon } from "./components/SecondaryGoalIcon";

export function RenewGoalSheet({
  goal,
  startLabel,
  isSaving,
  onConfirm,
  onChange,
  onClose,
}: {
  goal: ReadingGoal | null;
  startLabel: string;
  isSaving: boolean;
  onConfirm: () => void;
  onChange: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={!!goal} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent
        className="gap-0 px-5"
      >
        {goal && (
          <div className="space-y-4 pb-5">
            <div className="space-y-1 pr-8">
              <SheetTitle className="text-[20px] font-bold text-foreground">
                {t("goals.detail.renewSheetTitle")}
              </SheetTitle>
              <SheetDescription className="text-[14px] text-muted-foreground">
                {t("goals.detail.renewSheetDescription")}
              </SheetDescription>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
              <SecondaryGoalIcon type={goal.type} />
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-foreground">
                  {t(`goals.detail.goalTitle.${goal.type}`, { count: goal.target })}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {t("goals.detail.renewSameTarget")}
                </p>
              </div>
            </div>

            <p className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[14px] font-medium text-primary">
              <CalendarDays className="size-4" aria-hidden="true" />
              {startLabel}
            </p>

            <div className="space-y-1">
              <Button
                onClick={onConfirm}
                disabled={isSaving}
                className="h-auto w-full rounded-xl py-[14px] text-[15px] font-medium"
              >
                {isSaving ? t("common.loading") : t("goals.detail.renewConfirm")}
              </Button>
              <Button
                variant="ghost"
                onClick={onChange}
                disabled={isSaving}
                className="h-auto w-full py-3 text-[15px] text-primary"
              >
                {t("goals.detail.change")}
              </Button>
            </div>
          </div>
        )}
      </BottomSheetContent>
    </Sheet>
  );
}
