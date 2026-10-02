import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal, SecondaryGoalType } from "@/api/goals";
import { GoalSlider } from "@/components/shared/GoalSlider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { SECONDARY_GOAL_SLIDERS } from "@/lib/goals";

export function EditGoalTargetSheet({
  goal,
  value,
  current,
  isSaving,
  onChange,
  onSave,
  onClose,
}: {
  goal: ReadingGoal | null;
  value: number;
  /** Avanzamento della settimana in corso; null per un goal programmato. */
  current: number | null;
  isSaving: boolean;
  onChange: (value: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const type = goal?.type as SecondaryGoalType | undefined;
  const willComplete =
    goal !== null && current !== null && value !== goal.target && current >= value;

  return (
    <Sheet open={!!goal} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent
        className="gap-0 px-5"
      >
        {goal && type && (
          <div className="space-y-4 pb-5">
            <SheetTitle className="pr-8 text-[20px] font-bold text-foreground">
              {t("goals.detail.editSheetTitle")}
            </SheetTitle>
            <div className="overflow-hidden rounded-2xl border border-border">
              <GoalSlider
                id="edit-goal-target"
                label={
                  type === "days"
                    ? t("goals.daysSliderLabel")
                    : t("goals.pagesSliderLabel")
                }
                value={value}
                {...SECONDARY_GOAL_SLIDERS[type]}
                onChange={onChange}
              />
            </div>
            {willComplete && type && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-xl bg-accent px-3 py-2.5 text-[13px] text-foreground"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {t("goals.detail.editWillComplete", {
                  progress: t(`goals.${type}Value`, { count: current }),
                })}
              </p>
            )}
            <Button
              onClick={onSave}
              disabled={isSaving || value === goal.target}
              className="h-auto w-full rounded-xl py-[14px] text-[15px] font-medium disabled:opacity-60"
            >
              {isSaving ? t("common.loading") : t("goals.detail.editSave")}
            </Button>
          </div>
        )}
      </BottomSheetContent>
    </Sheet>
  );
}
