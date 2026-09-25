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
  isSaving,
  onChange,
  onSave,
  onClose,
}: {
  goal: ReadingGoal | null;
  value: number;
  isSaving: boolean;
  onChange: (value: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const type = goal?.type as SecondaryGoalType | undefined;

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
