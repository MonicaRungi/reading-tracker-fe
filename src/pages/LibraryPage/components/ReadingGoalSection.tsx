import { ChevronRight, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { GoalProgressRing } from "./GoalProgressRing";

export function ReadingGoalSection({
  goal,
  current,
  year,
  onCreateGoal,
  onOpenGoals,
}: {
  goal: ReadingGoal | null;
  current: number;
  year: number;
  onCreateGoal: () => void;
  onOpenGoals: () => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="px-4 pb-4 pt-1">
      <h2 className="mb-3 text-[17px] font-bold text-foreground">
        {t("goals.librarySectionTitle")}
      </h2>

      {goal ? (
        <Button
          variant="ghost"
          onClick={onOpenGoals}
          className="h-auto w-full justify-start gap-4 whitespace-normal rounded-2xl bg-accent px-4 py-4 text-left font-normal hover:bg-accent active:opacity-80"
        >
          <GoalProgressRing ratio={current / goal.target} />
          <div className="min-w-0 flex-1">
            <p className="text-[20px] font-bold text-foreground">
              {t("goals.primaryProgress", {
                count: goal.target,
                current: formatNumber(current),
                target: formatNumber(goal.target),
              })}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {current >= goal.target
                ? t("goals.annualGoalReached")
                : t("goals.annualGoal")}
            </p>
          </div>
          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={onCreateGoal}
          className="h-auto w-full justify-start gap-4 whitespace-normal rounded-2xl bg-accent px-4 py-4 text-left font-normal hover:bg-accent active:opacity-80"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background">
            <Target className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-foreground">
              {t("goals.emptyTitle", { year })}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {t("goals.emptySubtitle")}
            </p>
          </div>
          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      )}
    </section>
  );
}
