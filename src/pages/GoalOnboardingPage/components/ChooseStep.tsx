import { BookOpen, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { SecondaryGoalChoice, SecondaryGoalType } from "@/api/goals";
import { SecondaryGoalsPicker } from "@/components/shared/SecondaryGoalsPicker";
import type { PrimaryChoice } from "../hooks/useGoalOnboardingData";
import { OnboardingIntro } from "./OnboardingIntro";
import { SectionHeading } from "./SectionHeading";
import { PrimaryGoalPicker } from "./PrimaryGoalPicker";
import { JourneySummary } from "./JourneySummary";

export function ChooseStep({
  primaryChoice,
  customTarget,
  primaryTarget,
  secondaryTypes,
  secondaryGoals,
  secondaryTargets,
  canContinue,
  onSelectPrimary,
  onCustomTargetChange,
  onToggleSecondary,
  onSecondaryTargetChange,
  onContinue,
}: {
  primaryChoice: PrimaryChoice;
  customTarget: string;
  primaryTarget: number | null;
  secondaryTypes: SecondaryGoalType[];
  secondaryGoals: SecondaryGoalChoice[];
  secondaryTargets: Record<SecondaryGoalType, number>;
  canContinue: boolean;
  onSelectPrimary: (value: PrimaryChoice) => void;
  onCustomTargetChange: (value: string) => void;
  onToggleSecondary: (type: SecondaryGoalType) => void;
  onSecondaryTargetChange: (type: SecondaryGoalType, target: number) => void;
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
        <SecondaryGoalsPicker
          selected={secondaryTypes}
          targets={secondaryTargets}
          onToggle={onToggleSecondary}
          onTargetChange={onSecondaryTargetChange}
        />
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
