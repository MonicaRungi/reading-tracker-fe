import { Archive, CheckCircle2, Clock, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { GoalProgressRow } from "./GoalProgressRow";
import { SecondaryGoalIcon } from "./SecondaryGoalIcon";

export function SecondaryGoalCard({
  goal,
  current,
  isScheduled,
  startLabel,
  onEdit,
  onArchive,
}: {
  goal: ReadingGoal;
  current: number;
  isScheduled: boolean;
  startLabel: string;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const { t } = useTranslation();
  const isReached = goal.status === "achieved";

  return (
    <div className="space-y-3 rounded-2xl bg-card px-4 py-4">
      <div className="flex items-start gap-3">
        <SecondaryGoalIcon type={goal.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] font-bold text-foreground">
              {t(`goals.detail.goalTitle.${goal.type}`, { count: goal.target })}
            </p>
            {isScheduled && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Clock className="size-3" aria-hidden="true" />
                {t("goals.detail.scheduled")}
              </span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground">
            {isScheduled
              ? startLabel
              : t(`goals.detail.goalDescription.${goal.type}`)}
          </p>
        </div>
      </div>

      {!isScheduled && (
        <GoalProgressRow
          label={t(`goals.detail.progress.${goal.type}`, {
            count: goal.target,
            current: formatNumber(Math.min(current, goal.target)),
            target: formatNumber(goal.target),
          })}
          ratio={current / goal.target}
        />
      )}

      {isReached ? (
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-primary">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {t("goals.detail.reachedThisWeek")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={onEdit}
            className="h-auto gap-2 rounded-xl py-2.5 text-[14px]"
          >
            <Pencil className="size-4" aria-hidden="true" />
            {t("goals.detail.edit")}
          </Button>
          <Button
            variant="secondary"
            onClick={onArchive}
            className="h-auto gap-2 rounded-xl py-2.5 text-[14px]"
          >
            <Archive className="size-4" aria-hidden="true" />
            {t("goals.detail.archive")}
          </Button>
        </div>
      )}
    </div>
  );
}
