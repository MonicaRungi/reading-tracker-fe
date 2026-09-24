import { BookOpen, CalendarDays, FileText, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SecondaryGoal } from "../hooks/useGoalOnboardingData";

export function JourneySummary({
  primaryTarget,
  secondaryGoals,
}: {
  primaryTarget: number | null;
  secondaryGoals: SecondaryGoal[];
}) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 rounded-2xl bg-card px-4 py-4" aria-live="polite">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent">
        <Sparkles className="size-[18px] text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 space-y-2 pt-2">
        <p className="text-[14px] font-bold text-foreground">
          {t("goals.journeyTitle")}
        </p>
        {primaryTarget !== null && (
          <p className="flex items-center gap-2 text-[13px] text-foreground">
            <BookOpen className="size-4 text-primary" aria-hidden="true" />
            {t("goals.journeyBooks", { count: primaryTarget })}
          </p>
        )}
        {secondaryGoals.map(({ type, target }) => (
          <p
            key={type}
            className="flex items-center gap-2 text-[13px] text-foreground"
          >
            {type === "days" ? (
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <FileText className="size-4 text-primary" aria-hidden="true" />
            )}
            {type === "days"
              ? t("goals.journeyDays", { count: target })
              : t("goals.journeyPages", { count: target })}
          </p>
        ))}
      </div>
    </div>
  );
}
