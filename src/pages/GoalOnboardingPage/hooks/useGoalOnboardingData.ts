import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createGoals } from "@/api/goals";
import type { CreateGoalInput } from "@/api/goals";
import { useAuth } from "@/hooks/useAuth";
import { getPeriodBounds } from "@/lib/goals";
import { invalidateProgressQueries } from "@/lib/progressQueries";

export const PRIMARY_PRESETS = [6, 12, 24] as const;
export type PrimaryChoice = (typeof PRIMARY_PRESETS)[number] | "custom";
export const SECONDARY_TYPES = ["days", "pages"] as const;
export type SecondaryType = (typeof SECONDARY_TYPES)[number];
export interface SecondaryGoal {
  type: SecondaryType;
  target: number;
}
export type OnboardingStep = "choose" | "review";
export const ONBOARDING_STEPS: OnboardingStep[] = ["choose", "review"];

export const DAYS_RANGE = { min: 1, max: 7, step: 1 } as const;
export const PAGES_RANGE = { min: 25, max: 300, step: 25 } as const;
export const PAGES_TICKS = [25, 50, 100, 150, 200, 250, 300] as const;

const UNIQUE_VIOLATION = "23505";

export function useGoalOnboardingData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<OnboardingStep>("choose");
  const [primaryChoice, setPrimaryChoice] = useState<PrimaryChoice>(12);
  const [customTarget, setCustomTarget] = useState("");
  const [secondaryTypes, setSecondaryTypes] = useState<SecondaryType[]>([]);
  const [daysTarget, setDaysTarget] = useState(4);
  const [pagesTarget, setPagesTarget] = useState(100);

  const year = new Date().getFullYear();
  const customValue = Number.parseInt(customTarget, 10);
  const primaryTarget =
    primaryChoice === "custom"
      ? Number.isFinite(customValue) && customValue > 0
        ? customValue
        : null
      : primaryChoice;
  const secondaryGoals: SecondaryGoal[] = SECONDARY_TYPES.filter((type) =>
    secondaryTypes.includes(type),
  ).map((type) => ({
    type,
    target: type === "days" ? daysTarget : pagesTarget,
  }));
  const canContinue = primaryTarget !== null;

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: () => {
      const goals: CreateGoalInput[] = [
        {
          type: "books",
          role: "primary",
          period: "year",
          target: primaryTarget!,
          ...getPeriodBounds("year"),
        },
      ];
      for (const secondary of secondaryGoals) {
        goals.push({
          type: secondary.type,
          role: "secondary",
          period: "week",
          target: secondary.target,
          ...getPeriodBounds("week"),
        });
      }
      return createGoals(user!.id, goals);
    },
    onSuccess: async () => {
      await invalidateProgressQueries(queryClient, user?.id);
      toast.success(t("goals.created"));
      navigate("/library", { replace: true });
    },
    onError: async (error: { code?: string }) => {
      if (error.code === UNIQUE_VIOLATION) {
        toast.error(t("goals.alreadyExists"));
        await invalidateProgressQueries(queryClient, user?.id);
        navigate("/library", { replace: true });
        return;
      }
      toast.error(t("common.error"));
    },
  });

  return {
    data: { year, primaryTarget, secondaryGoals, canContinue },
    ui: {
      step,
      stepNumber: ONBOARDING_STEPS.indexOf(step) + 1,
      stepCount: ONBOARDING_STEPS.length,
      primaryChoice,
      customTarget,
      secondaryTypes,
      daysTarget,
      pagesTarget,
      isSubmitting,
    },
    actions: {
      selectPrimary: setPrimaryChoice,
      setCustomTarget: (value: string) =>
        setCustomTarget(value.replace(/\D/g, "")),
      toggleSecondary: (type: SecondaryType) =>
        setSecondaryTypes((current) =>
          current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type],
        ),
      setDaysTarget,
      setPagesTarget,
      goToReview: () => {
        if (!canContinue) return;
        setStep("review");
        window.scrollTo({ top: 0 });
      },
      exitToLibrary: () => navigate("/library"),
      goBack: () => {
        if (step === "review") setStep("choose");
        else navigate(-1);
      },
      submit: () => submit(),
    },
  };
}
