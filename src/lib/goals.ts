import {
  addDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  parseISO,
} from "date-fns";
import type {
  CreateGoalInput,
  GoalPeriod,
  ReadingGoal,
  SecondaryGoalChoice,
  SecondaryGoalType,
} from "@/api/goals";
import { toISODate } from "@/lib/format";

export const SECONDARY_GOAL_TYPES: readonly SecondaryGoalType[] = ["days", "pages"];

/** Range e tacche degli slider dei secondari (onboarding e rinnovo). */
export const SECONDARY_GOAL_SLIDERS: Record<
  SecondaryGoalType,
  { min: number; max: number; step: number; ticks: readonly number[] }
> = {
  days: { min: 1, max: 7, step: 1, ticks: [1, 2, 3, 4, 5, 6, 7] },
  pages: { min: 25, max: 300, step: 25, ticks: [25, 50, 100, 150, 200, 250, 300] },
};

export const DEFAULT_SECONDARY_TARGETS: Record<SecondaryGoalType, number> = {
  days: 4,
  pages: 100,
};

/** Limiti del periodo corrente (ora locale). La settimana parte dal lunedì. */
export function getPeriodBounds(
  period: GoalPeriod,
  date: Date = new Date(),
): { period_start: string; period_end: string } {
  const [start, end] =
    period === "year"
      ? [startOfYear(date), endOfYear(date)]
      : period === "month"
        ? [startOfMonth(date), endOfMonth(date)]
        : [
            startOfWeek(date, { weekStartsOn: 1 }),
            endOfWeek(date, { weekStartsOn: 1 }),
          ];
  return {
    period_start: toISODate(start),
    period_end: toISODate(end),
  };
}

/** Il periodo del goal include oggi (ora locale, come getPeriodBounds). */
export function isGoalInCurrentPeriod(
  goal: ReadingGoal,
  date: Date = new Date(),
): boolean {
  const today = toISODate(date);
  return goal.period_start <= today && today <= goal.period_end;
}

export function goalYear(goal: ReadingGoal): number {
  return Number(goal.period_start.slice(0, 4));
}

export function isPrimaryYearGoal(goal: ReadingGoal): boolean {
  return goal.role === "primary" && goal.period === "year";
}

/** Il goal primary/year dell'anno indicato, se esiste (vincolo DB: al più uno). */
export function findPrimaryGoalForYear(
  goals: ReadingGoal[],
  year: number,
): ReadingGoal | null {
  return (
    goals.find((g) => isPrimaryYearGoal(g) && goalYear(g) === year) ?? null
  );
}

export function computeGoalProgress(
  goal: ReadingGoal,
  finishedDates: string[],
  log: { log_date: string; pages_read: number }[],
): number {
  const inPeriod = (d: string) =>
    d >= goal.period_start && d <= goal.period_end;

  switch (goal.type) {
    case "books":
      return finishedDates.filter(inPeriod).length;
    case "days":
      return new Set(
        log
          .filter((r) => r.pages_read > 0 && inPeriod(r.log_date))
          .map((r) => r.log_date),
      ).size;
    case "pages":
      return log
        .filter((r) => inPeriod(r.log_date))
        .reduce((sum, r) => sum + r.pages_read, 0);
  }
}

// --- Secondari: periodi, programmazione e rinnovo -------------------------

/** Lunedì della settimana di `date`, 'YYYY-MM-DD'. */
export function weekStart(date: Date = new Date()): string {
  return toISODate(startOfWeek(date, { weekStartsOn: 1 }));
}

/** Settimana (lun–dom) che contiene la data 'YYYY-MM-DD' indicata. */
export function weekPeriodFrom(start: string): {
  period_start: string;
  period_end: string;
} {
  const day = parseISO(start);
  return {
    period_start: toISODate(startOfWeek(day, { weekStartsOn: 1 })),
    period_end: toISODate(endOfWeek(day, { weekStartsOn: 1 })),
  };
}

function secondariesOfType(goals: ReadingGoal[], type: SecondaryGoalType) {
  return goals.filter((g) => g.role === "secondary" && g.type === type);
}

/**
 * Da quando può partire un nuovo secondario di questo tipo: la prima settimana
 * dopo il `period_end` dell'ultimo goal dello stesso tipo (archiviati inclusi,
 * così archiviare e ricreare non riusa la stessa settimana), mai nel passato:
 * `max(ultimo.period_end + 1 giorno, lunedì corrente)`.
 */
export function nextSecondaryStart(
  goals: ReadingGoal[],
  type: SecondaryGoalType,
  date: Date = new Date(),
): string {
  const monday = weekStart(date);
  const latestEnd = secondariesOfType(goals, type).reduce(
    (max, g) => (g.period_end > max ? g.period_end : max),
    "",
  );
  if (!latestEnd) return monday;
  const after = toISODate(addDays(parseISO(latestEnd), 1));
  return after > monday ? after : monday;
}

/** Secondari da mostrare: in corso (anche già raggiunti) o programmati. */
export function visibleSecondaries(
  goals: ReadingGoal[],
  date: Date = new Date(),
): ReadingGoal[] {
  const today = toISODate(date);
  return goals
    .filter(
      (g) =>
        g.role === "secondary" &&
        (g.status === "active" || g.status === "achieved") &&
        g.period_end >= today,
    )
    .sort((a, b) => a.period_start.localeCompare(b.period_start));
}

export function isScheduled(goal: ReadingGoal, date: Date = new Date()): boolean {
  return goal.period_start > toISODate(date);
}

/** Tipi per cui si può ancora aggiungere un secondario (nessuno già programmato). */
export function addableSecondaryTypes(
  goals: ReadingGoal[],
  date: Date = new Date(),
): SecondaryGoalType[] {
  return SECONDARY_GOAL_TYPES.filter(
    (type) => !secondariesOfType(goals, type).some((g) => isScheduled(g, date)),
  );
}

export interface RenewalCandidate {
  goal: ReadingGoal;
  start: string;
}

/**
 * Secondari conclusi da proporre per il rinnovo. Per ogni tipo si guarda l'ultimo
 * goal: dev'essere `achieved`/`failed`, con il suo periodo finito, e l'invito vale
 * solo nella settimana subito successiva (quella in cui il nuovo può partire).
 * Un goal raggiunto mercoledì non genera l'invito fino al lunedì dopo.
 */
export function findRenewalCandidates(
  goals: ReadingGoal[],
  dismissedIds: string[],
  date: Date = new Date(),
): RenewalCandidate[] {
  const today = toISODate(date);
  const monday = weekStart(date);

  return SECONDARY_GOAL_TYPES.flatMap((type) => {
    const ofType = secondariesOfType(goals, type);
    if (ofType.length === 0) return [];
    const latest = ofType.reduce((a, b) => (b.period_end > a.period_end ? b : a));
    if (latest.status !== "achieved" && latest.status !== "failed") return [];
    if (latest.period_end >= today) return [];
    const start = toISODate(addDays(parseISO(latest.period_end), 1));
    if (start !== monday) return [];
    if (dismissedIds.includes(latest.id)) return [];
    return [{ goal: latest, start }];
  });
}

/** Righe da inserire per i secondari scelti, ognuno nel suo primo periodo libero. */
export function buildSecondaryGoalInputs(
  goals: ReadingGoal[],
  choices: SecondaryGoalChoice[],
  date: Date = new Date(),
): CreateGoalInput[] {
  return choices.map(({ type, target }) => ({
    type,
    role: "secondary",
    period: "week",
    target,
    ...weekPeriodFrom(nextSecondaryStart(goals, type, date)),
  }));
}
