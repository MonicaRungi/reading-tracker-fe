import { BookOpen, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DAYS_RANGE,
  PAGES_RANGE,
  PAGES_TICKS,
  type PrimaryChoice,
  type SecondaryGoal,
  type SecondaryType,
} from "../hooks/useGoalOnboardingData";
import { OnboardingIntro } from "./OnboardingIntro";
import { SectionHeading } from "./SectionHeading";
import { PrimaryGoalPicker } from "./PrimaryGoalPicker";
import { SecondaryGoalOption } from "./SecondaryGoalOption";
import { GoalSlider } from "./GoalSlider";
import { JourneySummary } from "./JourneySummary";

const DAYS_TICKS = [1, 2, 3, 4, 5, 6, 7] as const;

export function ChooseStep({
  primaryChoice,
  customTarget,
  primaryTarget,
  secondaryTypes,
  secondaryGoals,
  daysTarget,
  pagesTarget,
  canContinue,
  onSelectPrimary,
  onCustomTargetChange,
  onToggleSecondary,
  onDaysChange,
  onPagesChange,
  onContinue,
}: {
  primaryChoice: PrimaryChoice;
  customTarget: string;
  primaryTarget: number | null;
  secondaryTypes: SecondaryType[];
  secondaryGoals: SecondaryGoal[];
  daysTarget: number;
  pagesTarget: number;
  canContinue: boolean;
  onSelectPrimary: (value: PrimaryChoice) => void;
  onCustomTargetChange: (value: string) => void;
  onToggleSecondary: (value: SecondaryType) => void;
  onDaysChange: (value: number) => void;
  onPagesChange: (value: number) => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 px-4 pb-8 pt-2">
      <OnboardingIntro
        title={t("goals.onboardingTitle")}
        subtitle={t("goals.onboardingSubtitle")}
        illustration="books"
      />

      <section className="space-y-3">
        <SectionHeading icon={BookOpen} title={t("goals.primaryQuestion")} />
        <PrimaryGoalPicker
          value={primaryChoice}
          customTarget={customTarget}
          onChange={onSelectPrimary}
          onCustomTargetChange={onCustomTargetChange}
        />
      </section>

      <section className="space-y-3">
        <SectionHeading
          icon={Target}
          title={t("goals.secondaryQuestion")}
          subtitle={t("goals.secondarySubtitle")}
        />
        <div className="space-y-2.5">
          <SecondaryGoalOption
            id="secondary-goal-days"
            label={t("goals.secondaryDays")}
            illustration="calendar"
            checked={secondaryTypes.includes("days")}
            onToggle={() => onToggleSecondary("days")}
          >
            <GoalSlider
              id="secondary-goal-days-slider"
              label={t("goals.daysSliderLabel")}
              value={daysTarget}
              {...DAYS_RANGE}
              ticks={DAYS_TICKS}
              onChange={onDaysChange}
            />
          </SecondaryGoalOption>

          <SecondaryGoalOption
            id="secondary-goal-pages"
            label={t("goals.secondaryPages")}
            illustration="pages"
            checked={secondaryTypes.includes("pages")}
            onToggle={() => onToggleSecondary("pages")}
          >
            <GoalSlider
              id="secondary-goal-pages-slider"
              label={t("goals.pagesSliderLabel")}
              value={pagesTarget}
              {...PAGES_RANGE}
              ticks={PAGES_TICKS}
              onChange={onPagesChange}
            />
          </SecondaryGoalOption>
        </div>
      </section>

      <JourneySummary
        primaryTarget={primaryTarget}
        secondaryGoals={secondaryGoals}
      />

      <Button
        onClick={onContinue}
        disabled={!canContinue}
        className="h-auto w-full rounded-xl py-[15px] text-[15px] font-medium disabled:opacity-60"
      >
        {t("goals.continue")}
      </Button>
    </div>
  );
}
