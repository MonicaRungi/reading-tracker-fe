import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Illustration } from "@/components/shared/Illustration";
import { Button } from "@/components/ui/button";
import { formatDayMonth } from "@/lib/format";
import { SecondaryGoalIcon } from "./SecondaryGoalIcon";

export function RenewalPrompt({
  goal,
  startLabel,
  onRenew,
  onChange,
  onDismiss,
}: {
  goal: ReadingGoal;
  startLabel: string;
  onRenew: () => void;
  onChange: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-2xl border border-primary/20 bg-accent px-4 py-4">
      <div className="flex items-start gap-3">
        <SecondaryGoalIcon type={goal.type} />
        <div className="min-w-0 flex-1">
          <p className="pr-6 text-[15px] font-bold leading-snug text-foreground">
            {t("goals.detail.renewalTitle")}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {t(`goals.detail.goalTitle.${goal.type}`, { count: goal.target })} ·{" "}
            {t("goals.detail.renewalConcluded", {
              date: formatDayMonth(goal.period_end),
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label={t("goals.detail.dismiss")}
          className="-mr-2 -mt-1 rounded-full text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="pb-1 text-[13px] font-medium text-foreground">{startLabel}</p>
        <Illustration name="books" className="size-16" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onRenew} className="h-auto rounded-xl py-3 text-[15px]">
          {t("goals.detail.renew")}
        </Button>
        <Button
          variant="outline"
          onClick={onChange}
          className="h-auto rounded-xl border-primary py-3 text-[15px] text-primary"
        >
          {t("goals.detail.change")}
        </Button>
      </div>
    </div>
  );
}
