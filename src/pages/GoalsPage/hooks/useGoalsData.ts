import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  archiveGoal,
  createGoals,
  getGoalsProgress,
  listGoals,
  updateGoalTarget,
  type ReadingGoal,
  type SecondaryGoalChoice,
  type SecondaryGoalType,
} from "@/api/goals";
import { useAuth } from "@/hooks/useAuth";
import { formatWeekdayDate, toISODate } from "@/lib/format";
import {
  DEFAULT_SECONDARY_TARGETS,
  SECONDARY_GOAL_TYPES,
  addableSecondaryTypes,
  buildSecondaryGoalInputs,
  findPrimaryGoalForYear,
  findRenewalCandidates,
  isGoalInCurrentPeriod,
  nextSecondaryStart,
  visibleSecondaries,
} from "@/lib/goals";
import { invalidateProgressQueries } from "@/lib/progressQueries";
import {
  dismissRenewal,
  getDismissedRenewals,
  subscribeRenewalDismissals,
} from "@/lib/renewalDismissals";

export interface GoalsBanner {
  title: string;
  message: string;
}

interface PickerState {
  selected: SecondaryGoalType[];
  targets: Record<SecondaryGoalType, number>;
  /** Invito da cui è partito "Cambia" (per il testo del banner). */
  fromRenewal: boolean;
}

export function useGoalsData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const [renewTarget, setRenewTarget] = useState<ReadingGoal | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [editTarget, setEditTarget] = useState<ReadingGoal | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [archiveTarget, setArchiveTarget] = useState<ReadingGoal | null>(null);
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);
  const [banner, setBanner] = useState<GoalsBanner | null>(null);

  const dismissedIds = useSyncExternalStore(subscribeRenewalDismissals, () =>
    getDismissedRenewals(userId),
  );

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", userId],
    queryFn: () => listGoals(),
    enabled: Boolean(userId),
  });

  const today = toISODate();
  const year = new Date().getFullYear();
  const primary = findPrimaryGoalForYear(goals, year);
  const secondaries = visibleSecondaries(goals);
  const archived = goals.filter(
    (g) => g.role === "secondary" && g.status === "archived",
  );
  const renewals = findRenewalCandidates(goals, dismissedIds);
  const addableTypes = addableSecondaryTypes(goals);

  const progressGoals = [primary, ...secondaries].filter(
    (g): g is ReadingGoal => Boolean(g) && isGoalInCurrentPeriod(g!),
  );
  const { data: progress = {} } = useQuery({
    queryKey: ["goal-progress", userId, progressGoals.map((g) => g.id).join(",")],
    queryFn: () => getGoalsProgress(progressGoals),
    enabled: Boolean(userId) && progressGoals.length > 0,
  });

  function goalTitle(type: SecondaryGoalType, target: number) {
    return t(`goals.detail.goalTitle.${type}`, { count: target });
  }

  function startLabel(start: string) {
    const date = formatWeekdayDate(start);
    return start > today
      ? t("goals.detail.startsOn", { date })
      : t("goals.detail.startedOn", { date });
  }

  function showBanner(title: string, choices: SecondaryGoalChoice[]) {
    const messages = choices.map(({ type, target }) => {
      const start = nextSecondaryStart(goals, type);
      const date = formatWeekdayDate(start);
      return start > today
        ? t("goals.detail.bannerFuture", { title: goalTitle(type, target), date })
        : t("goals.detail.bannerNow", { title: goalTitle(type, target), date });
    });
    setBanner({ title, message: messages.join(" ") });
  }

  // --- Creazione (Rinnova / Salva obiettivi) ------------------------------

  const { mutate: createSecondaries, isPending: isCreating } = useMutation({
    mutationFn: (choices: SecondaryGoalChoice[]) =>
      createGoals(userId, buildSecondaryGoalInputs(goals, choices)),
    onSuccess: async (_data, choices) => {
      showBanner(
        renewTarget || picker?.fromRenewal
          ? t("goals.detail.renewedTitle")
          : t("goals.detail.savedTitle"),
        choices,
      );
      setRenewTarget(null);
      setPicker(null);
      await invalidateProgressQueries(queryClient, userId);
    },
    onError: () => toast.error(t("common.error")),
  });

  // --- Modifica target ----------------------------------------------------

  const { mutate: saveTarget, isPending: isSavingTarget } = useMutation({
    mutationFn: ({ goalId, target }: { goalId: string; target: number }) =>
      updateGoalTarget(goalId, target),
    onSuccess: async () => {
      toast.success(t("goals.detail.updated"));
      setEditTarget(null);
      await invalidateProgressQueries(queryClient, userId);
    },
    onError: () => toast.error(t("common.error")),
  });

  // --- Archiviazione ------------------------------------------------------

  const { mutate: archive, isPending: isArchiving } = useMutation({
    mutationFn: (goalId: string) => archiveGoal(goalId),
    onSuccess: async () => {
      toast.success(t("goals.detail.archived"));
      setArchiveTarget(null);
      await invalidateProgressQueries(queryClient, userId);
    },
    onError: () => toast.error(t("common.error")),
  });

  const pickerStarts = picker
    ? [...new Set(picker.selected.map((type) => nextSecondaryStart(goals, type)))]
    : [];

  return {
    data: {
      isLoading,
      year,
      primary,
      primaryCurrent: primary ? (progress[primary.id] ?? 0) : 0,
      secondaries: secondaries.map((goal) => ({
        goal,
        current: progress[goal.id] ?? 0,
        isScheduled: goal.period_start > today,
        startLabel: startLabel(goal.period_start),
      })),
      renewals: renewals.map(({ goal, start }) => ({
        goal,
        start,
        startLabel: startLabel(start),
      })),
      archived,
      canAddSecondary: addableTypes.length > 0,
      renewStartLabel: renewTarget
        ? startLabel(nextSecondaryStart(goals, renewTarget.type as SecondaryGoalType))
        : "",
      // Avanzamento della settimana in corso per il goal in modifica; null se
      // il goal è programmato (non si chiude prima del suo periodo).
      editCurrent:
        editTarget && isGoalInCurrentPeriod(editTarget)
          ? (progress[editTarget.id] ?? 0)
          : null,
      pickerTypes: addableTypes,
      pickerStartLabels: pickerStarts.map(startLabel),
    },
    ui: {
      banner,
      renewTarget,
      picker,
      editTarget,
      editValue,
      archiveTarget,
      isArchivedOpen,
      isCreating,
      isSavingTarget,
      isArchiving,
    },
    actions: {
      goBack: () => navigate(-1),
      goToOnboarding: () => navigate("/goals/onboarding"),
      closeBanner: () => setBanner(null),
      // invito
      dismissRenewal: (goal: ReadingGoal) => dismissRenewal(userId, goal.id),
      openRenew: (goal: ReadingGoal) => setRenewTarget(goal),
      closeRenew: () => setRenewTarget(null),
      confirmRenew: () =>
        renewTarget &&
        createSecondaries([
          {
            type: renewTarget.type as SecondaryGoalType,
            target: renewTarget.target,
          },
        ]),
      // selettore
      openPickerFor: (goal: ReadingGoal) => {
        const type = goal.type as SecondaryGoalType;
        setRenewTarget(null);
        setPicker({
          selected: [type],
          targets: { ...DEFAULT_SECONDARY_TARGETS, [type]: goal.target },
          fromRenewal: true,
        });
      },
      openPicker: () =>
        setPicker({
          selected: [],
          targets: DEFAULT_SECONDARY_TARGETS,
          fromRenewal: false,
        }),
      closePicker: () => setPicker(null),
      togglePickerType: (type: SecondaryGoalType) =>
        setPicker((current) =>
          current && {
            ...current,
            selected: current.selected.includes(type)
              ? current.selected.filter((t) => t !== type)
              : [...current.selected, type],
          },
        ),
      setPickerTarget: (type: SecondaryGoalType, target: number) =>
        setPicker(
          (current) =>
            current && { ...current, targets: { ...current.targets, [type]: target } },
        ),
      savePicker: () =>
        picker &&
        picker.selected.length > 0 &&
        createSecondaries(
          SECONDARY_GOAL_TYPES.filter(
            (type) => picker.selected.includes(type) && addableTypes.includes(type),
          ).map((type) => ({ type, target: picker.targets[type] })),
        ),
      // modifica
      openEdit: (goal: ReadingGoal) => {
        setEditTarget(goal);
        setEditValue(goal.target);
      },
      closeEdit: () => setEditTarget(null),
      setEditValue,
      saveEdit: () =>
        editTarget && saveTarget({ goalId: editTarget.id, target: editValue }),
      // archiviazione
      requestArchive: (goal: ReadingGoal) => setArchiveTarget(goal),
      cancelArchive: () => setArchiveTarget(null),
      confirmArchive: () => archiveTarget && archive(archiveTarget.id),
      openArchived: () => setIsArchivedOpen(true),
      closeArchived: () => setIsArchivedOpen(false),
    },
  };
}
