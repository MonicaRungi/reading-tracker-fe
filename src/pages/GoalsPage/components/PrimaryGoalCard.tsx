import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Illustration } from "@/components/shared/Illustration";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/format";
import { GoalProgressRow } from "./GoalProgressRow";

export function PrimaryGoalCard({
  goal,
  current,
  year,
  onCreate,
}: {
  goal: ReadingGoal | null;
  current: number;
  year: number;
  onCreate: () => void;
}) {
  const { t } = useTranslation();

  if (!goal) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-4 py-6 text-center">
        <Illustration name="target" className="size-16" />
        <p className="text-[15px] font-semibold text-foreground">
          {t("goals.detail.primaryEmptyTitle", { year })}
        </p>
        <Button onClick={onCreate} className="h-auto rounded-xl px-5 py-2.5 text-[14px]">
          {t("goals.detail.primaryEmptyCta")}
        </Button>
      </div>
    );
  }

  const reached = goal.status === "achieved" || current >= goal.target;

  return (
    <div className="flex gap-3 rounded-2xl bg-card px-4 py-4">
      <Illustration name="open-book" className="size-20" />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-[16px] font-bold text-foreground">
            {t("goals.detail.primaryHeading", { count: goal.target, year })}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {t("goals.detail.primaryDescription", {
              count: goal.target,
              date: formatDate(goal.period_end),
            })}
          </p>
        </div>
        <GoalProgressRow
          label={t("goals.primaryProgress", {
            count: goal.target,
            current: formatNumber(Math.min(current, goal.target)),
            target: formatNumber(goal.target),
          })}
          ratio={current / goal.target}
        />
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          {reached ? (
            <span className="font-medium text-primary">
              {t("goals.detail.primaryReached")}
            </span>
          ) : (
            <>
              <Lock className="size-3.5" aria-hidden="true" />
              {t("goals.detail.primaryLocked")}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
