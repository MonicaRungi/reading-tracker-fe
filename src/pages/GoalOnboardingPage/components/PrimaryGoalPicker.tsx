import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  PRIMARY_PRESETS,
  type PrimaryChoice,
} from "../hooks/useGoalOnboardingData";
import { PrimaryGoalOption } from "./PrimaryGoalOption";

const PRESET_ILLUSTRATIONS = { 6: "book", 12: "books", 24: "books" } as const;

export function PrimaryGoalPicker({
  value,
  customTarget,
  onChange,
  onCustomTargetChange,
}: {
  value: PrimaryChoice;
  customTarget: string;
  onChange: (value: PrimaryChoice) => void;
  onCustomTargetChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <RadioGroup
      value={String(value)}
      onValueChange={(next) =>
        onChange(next === "custom" ? "custom" : (Number(next) as PrimaryChoice))
      }
      className="gap-2.5"
    >
      {PRIMARY_PRESETS.map((count) => (
        <PrimaryGoalOption
          key={count}
          value={String(count)}
          title={t("goals.primaryPreset", { count })}
          hint={t(`goals.primaryHint${count}`)}
          illustration={PRESET_ILLUSTRATIONS[count]}
          selected={value === count}
        />
      ))}

      <PrimaryGoalOption
        value="custom"
        title={t("goals.primaryCustom")}
        hint={t("goals.primaryCustomHint")}
        illustration="add-book"
        selected={value === "custom"}
      >
        {value === "custom" && (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
            <label htmlFor="primary-goal-custom-target" className="sr-only">
              {t("goals.primaryCustomLabel")}
            </label>
            <Input
              id="primary-goal-custom-target"
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder={t("goals.primaryCustomPlaceholder")}
              value={customTarget}
              onChange={(e) => onCustomTargetChange(e.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
            <span className="h-4 w-px shrink-0 bg-border" />
            <span className="shrink-0 text-[13px] text-muted-foreground">
              {t("goals.primaryCustomLabel")}
            </span>
          </div>
        )}
      </PrimaryGoalOption>
    </RadioGroup>
  );
}
