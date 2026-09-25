import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { GoalPeriod, ReadingGoal } from "@/api/goals";
import { toISODate } from "@/lib/format";

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
