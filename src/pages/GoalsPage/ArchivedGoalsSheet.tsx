import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { formatDayMonth } from "@/lib/format";
import { SecondaryGoalIcon } from "./components/SecondaryGoalIcon";

export function ArchivedGoalsSheet({
  open,
  goals,
  onClose,
}: {
  open: boolean;
  goals: ReadingGoal[];
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent
        className="max-h-[80vh] gap-0 overflow-y-auto px-5"
      >
        <SheetTitle className="pb-4 pr-8 text-[20px] font-bold text-foreground">
          {t("goals.detail.archivedSheetTitle")}
        </SheetTitle>
        <ul className="space-y-2 pb-5">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3"
            >
              <SecondaryGoalIcon type={goal.type} />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground">
                  {t(`goals.detail.goalTitle.${goal.type}`, { count: goal.target })}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {t("goals.detail.archivedPeriod", {
                    start: formatDayMonth(goal.period_start),
                    end: formatDayMonth(goal.period_end),
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </BottomSheetContent>
    </Sheet>
  );
}
