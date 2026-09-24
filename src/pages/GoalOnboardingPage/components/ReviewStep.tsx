import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type {
  PrimaryChoice,
  SecondaryGoal,
} from "../hooks/useGoalOnboardingData";
import { GoalSummaryRow } from "./GoalSummaryRow";
import { OnboardingIntro } from "./OnboardingIntro";
import { LockNotice } from "./LockNotice";

export function ReviewStep({
  year,
  primaryChoice,
  primaryTarget,
  secondaryGoals,
  isSubmitting,
  onSubmit,
  onBack,
}: {
  year: number;
  primaryChoice: PrimaryChoice;
  primaryTarget: number;
  secondaryGoals: SecondaryGoal[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  const primaryHint =
    primaryChoice === "custom"
      ? t("goals.customHint")
      : t(`goals.primaryHint${primaryChoice}`);

  return (
    <div className="space-y-6 px-4 pb-8 pt-4">
      <OnboardingIntro
        title={t("goals.readyTitle")}
        subtitle={t("goals.readySubtitle")}
        illustration="open-book"
        layout="centered"
      />

      <div className="divide-y divide-primary/15 rounded-2xl bg-accent px-4">
        <GoalSummaryRow
          illustration="books"
          label={t("goals.primaryLabel")}
          value={t("goals.booksValue", { count: primaryTarget })}
          hint={primaryHint}
        />
        {secondaryGoals.map(({ type, target }) => (
          <GoalSummaryRow
            key={type}
            illustration={type === "days" ? "calendar" : "pages"}
            label={t("goals.secondaryLabel")}
            value={
              type === "days"
                ? t("goals.daysValue", { count: target })
                : t("goals.pagesValue", { count: target })
            }
            hint={t("goals.perWeek")}
          />
        ))}
      </div>

      <LockNotice text={t("goals.lockNotice", { year })} />

      <div className="space-y-2">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-auto w-full rounded-xl py-[15px] text-[15px] font-medium disabled:opacity-60"
        >
          {isSubmitting ? t("common.loading") : t("goals.start")}
        </Button>
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-auto w-full py-3 text-[14px] text-primary"
        >
          {t("goals.back")}
        </Button>
      </div>
    </div>
  );
}
