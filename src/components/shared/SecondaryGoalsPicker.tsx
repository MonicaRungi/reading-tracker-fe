import { useTranslation } from "react-i18next";
import type { SecondaryGoalType } from "@/api/goals";
import { GoalSlider } from "@/components/shared/GoalSlider";
import type { IllustrationName } from "@/components/shared/Illustration";
import { SecondaryGoalOption } from "@/components/shared/SecondaryGoalOption";
import { SECONDARY_GOAL_SLIDERS, SECONDARY_GOAL_TYPES } from "@/lib/goals";

const COPY: Record<
  SecondaryGoalType,
  { label: string; hint: string; sliderLabel: string; illustration: IllustrationName }
> = {
  days: {
    label: "goals.secondaryDays",
    hint: "goals.secondaryDaysHint",
    sliderLabel: "goals.daysSliderLabel",
    illustration: "calendar",
  },
  pages: {
    label: "goals.secondaryPages",
    hint: "goals.secondaryPagesHint",
    sliderLabel: "goals.pagesSliderLabel",
    illustration: "pages",
  },
};

/**
 * Scelta degli obiettivi secondari: righe con checkbox indipendenti (0, 1 o
 * entrambi) e, per ogni tipo selezionato, lo slider del target.
 * Usato dall'onboarding e dal rinnovo ("Cambia").
 */
export function SecondaryGoalsPicker({
  selected,
  targets,
  idPrefix = "secondary-goal",
  types = SECONDARY_GOAL_TYPES,
  showHints = false,
  onToggle,
  onTargetChange,
}: {
  selected: SecondaryGoalType[];
  targets: Record<SecondaryGoalType, number>;
  idPrefix?: string;
  /** Tipi mostrati (default: tutti). */
  types?: readonly SecondaryGoalType[];
  showHints?: boolean;
  onToggle: (type: SecondaryGoalType) => void;
  onTargetChange: (type: SecondaryGoalType, target: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2.5">
      {types.map((type) => (
        <SecondaryGoalOption
          key={type}
          id={`${idPrefix}-${type}`}
          label={t(COPY[type].label)}
          hint={showHints ? t(COPY[type].hint) : undefined}
          illustration={COPY[type].illustration}
          checked={selected.includes(type)}
          onToggle={() => onToggle(type)}
        >
          <GoalSlider
            id={`${idPrefix}-${type}-slider`}
            label={t(COPY[type].sliderLabel)}
            value={targets[type]}
            {...SECONDARY_GOAL_SLIDERS[type]}
            onChange={(target) => onTargetChange(type, target)}
          />
        </SecondaryGoalOption>
      ))}
    </div>
  );
}
