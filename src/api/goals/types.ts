import type { ReadingGoalRow } from "@/types/database.types"

export type GoalType = "books" | "days" | "pages"
export type GoalRole = "primary" | "secondary"
export type GoalPeriod = "year" | "month" | "week"
export type GoalStatus = "active" | "achieved" | "failed" | "archived"

export interface ReadingGoal
  extends Omit<ReadingGoalRow, "type" | "role" | "period" | "status"> {
  type: GoalType
  role: GoalRole
  period: GoalPeriod
  status: GoalStatus
}

export interface CreateGoalInput {
  type: GoalType
  role: GoalRole
  period: GoalPeriod
  target: number
  period_start: string // 'YYYY-MM-DD'
  period_end: string // 'YYYY-MM-DD'
}

/** Avanzamento corrente per goal: goalId → valore (libri, giorni o pagine). */
export type GoalProgressMap = Record<string, number>
