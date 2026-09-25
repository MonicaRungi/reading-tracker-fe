import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createGoals } from "@/api/goals";
import type {
  CreateGoalInput,
  SecondaryGoalChoice,
  SecondaryGoalType,
} from "@/api/goals";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_SECONDARY_TARGETS,
  SECONDARY_GOAL_TYPES,
  getPeriodBounds,
} from "@/lib/goals";
import { invalidateProgressQueries } from "@/lib/progressQueries";

export const PRIMARY_PRESETS = [6, 12, 24] as const;
export type PrimaryChoice = (typeof PRIMARY_PRESETS)[number] | "custom";
export type OnboardingStep = "choose" | "review";
export const ONBOARDING_STEPS: OnboardingStep[] = ["choose", "review"];

const UNIQUE_VIOLATION = "23505";

export function useGoalOnboardingData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<OnboardingStep>("choose");
  const [primaryChoice, setPrimaryChoice] = useState<PrimaryChoice>(12);
  const [customTarget, setCustomTarget] = useState("");
  const [secondaryTypes, setSecondaryTypes] = useState<SecondaryGoalType[]>([]);
  const [secondaryTargets, setSecondaryTargets] = useState(
    DEFAULT_SECONDARY_TARGETS,
  );

  const year = new Date().getFullYear();
  const customValue = Number.parseInt(customTarget, 10);
  const primaryTarget =
    primaryChoice === "custom"
      ? Number.isFinite(customValue) && customValue > 0
        ? customValue
        : null
      : primaryChoice;
  const secondaryGoals: SecondaryGoalChoice[] = SECONDARY_GOAL_TYPES.filter(
    (type) => secondaryTypes.includes(type),
  ).map((type) => ({ type, target: secondaryTargets[type] }));
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
      secondaryTargets,
      isSubmitting,
    },
    actions: {
      selectPrimary: setPrimaryChoice,
      setCustomTarget: (value: string) =>
        setCustomTarget(value.replace(/\D/g, "")),
      toggleSecondary: (type: SecondaryGoalType) =>
        setSecondaryTypes((current) =>
          current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type],
        ),
      setSecondaryTarget: (type: SecondaryGoalType, target: number) =>
        setSecondaryTargets((current) => ({ ...current, [type]: target })),
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
