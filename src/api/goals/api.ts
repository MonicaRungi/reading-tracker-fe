import { supabase } from "@/lib/supabase";
import { computeGoalProgress } from "@/lib/goals";
import type {
  CreateGoalInput,
  GoalProgressMap,
  ReadingGoal,
} from "./types";

export async function listGoals(): Promise<ReadingGoal[]> {
  const { data, error } = await supabase
    .from("reading_goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReadingGoal[];
}

export async function getActiveGoals(): Promise<ReadingGoal[]> {
  const { data, error } = await supabase
    .from("reading_goals")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReadingGoal[];
}

/**
 * Inserisce uno o più goal in un'unica insert (atomica).
 * Per role='primary' il trigger `lock_primary_goal` imposta is_locked=true.
 */
export async function createGoals(
  userId: string,
  inputs: CreateGoalInput[],
): Promise<ReadingGoal[]> {
  const { data, error } = await supabase
    .from("reading_goals")
    .insert(inputs.map((input) => ({ ...input, user_id: userId })))
    .select("*");
  if (error) throw error;
  return (data ?? []) as ReadingGoal[];
}

export async function createGoal(
  userId: string,
  input: CreateGoalInput,
): Promise<ReadingGoal> {
  const [goal] = await createGoals(userId, [input]);
  return goal;
}

/** Solo per obiettivi secondari: il primary confermato è immutabile. */
export async function updateGoalTarget(
  goalId: string,
  target: number,
): Promise<ReadingGoal> {
  const { data, error } = await supabase
    .from("reading_goals")
    .update({ target })
    .eq("id", goalId)
    .eq("role", "secondary")
    .select("*")
    .single();
  if (error) throw error;
  return data as ReadingGoal;
}

/** Abbandona un obiettivo secondario prima della scadenza. */
export async function archiveGoal(goalId: string): Promise<ReadingGoal> {
  const { data, error } = await supabase
    .from("reading_goals")
    .update({ status: "archived" })
    .eq("id", goalId)
    .eq("role", "secondary")
    .select("*")
    .single();
  if (error) throw error;
  return data as ReadingGoal;
}

/**
 * Valore corrente di ciascun goal nel suo periodo, con la stessa logica del
 * job `close_expired_reading_goals`: libri con finished_at nel periodo,
 * giorni distinti con pagine lette, somma pagine da reading_log.
 */
export async function getGoalsProgress(
  goals: ReadingGoal[],
): Promise<GoalProgressMap> {
  if (goals.length === 0) return {};

  const from = goals.reduce(
    (min, g) => (g.period_start < min ? g.period_start : min),
    goals[0].period_start,
  );
  const to = goals.reduce(
    (max, g) => (g.period_end > max ? g.period_end : max),
    goals[0].period_end,
  );

  const [readItems, logRows] = await Promise.all([
    supabase
      .from("library_items")
      .select("finished_at")
      .eq("status", "read")
      .gte("finished_at", from)
      .lte("finished_at", to),
    supabase
      .from("reading_log")
      .select("log_date, pages_read")
      .gte("log_date", from)
      .lte("log_date", to),
  ]);
  if (readItems.error) throw readItems.error;
  if (logRows.error) throw logRows.error;

  const finishedDates = readItems.data
    .map((r) => r.finished_at)
    .filter((d): d is string => Boolean(d));

  return Object.fromEntries(
    goals.map((goal) => [
      goal.id,
      computeGoalProgress(goal, finishedDates, logRows.data),
    ]),
  );
}
