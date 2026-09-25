import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { listLibrary } from "@/api/library"
import { getGoalsProgress, listGoals } from "@/api/goals"
import { findPrimaryGoalForYear } from "@/lib/goals"
import { useAuth } from "@/hooks/useAuth"
import { useNotifications } from "@/hooks/useNotifications"
import type { ReadingStatus } from "@/api/library"

export type LibraryFilter = "all" | ReadingStatus

export function useLibraryData() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? ""
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [query, setQuery] = useState("")
  const { unreadCount } = useNotifications()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", userId],
    queryFn: () => listLibrary(),
    enabled: Boolean(userId),
  })

  const { data: goals, isLoading: isLoadingGoals } = useQuery({
    queryKey: ["goals", userId],
    queryFn: () => listGoals(),
    enabled: Boolean(userId),
  })

  const year = new Date().getFullYear()
  const primaryGoal = goals ? findPrimaryGoalForYear(goals, year) : null

  const { data: goalProgress } = useQuery({
    queryKey: ["goal-progress", userId, primaryGoal?.id],
    queryFn: () => getGoalsProgress([primaryGoal!]),
    enabled: Boolean(userId && primaryGoal),
  })

  const primaryGoalCurrent = primaryGoal
    ? (goalProgress?.[primaryGoal.id] ?? 0)
    : 0

  const items = data ?? []
  const reading = items.filter((item) => item.status === "reading")

  const normalizedQuery = query.trim().toLowerCase()
  const matchesQuery = (item: (typeof items)[number]) =>
    !normalizedQuery ||
    item.book.title.toLowerCase().includes(normalizedQuery) ||
    (item.book.authors ?? []).some((author) =>
      author.toLowerCase().includes(normalizedQuery),
    )

  const grid = items
    .filter((item) => filter === "all" || item.status === filter)
    .filter(matchesQuery)
  const isEmpty = !isLoading && items.length === 0

  return {
    data: {
      reading,
      grid,
      items,
      isLoading,
      isError,
      isEmpty,
      year,
      primaryGoal,
      primaryGoalCurrent,
      isLoadingGoals,
      unreadNotifications: unreadCount,
    },
    ui: { filter, query },
    actions: {
      setFilter: (next: LibraryFilter | "") => next && setFilter(next),
      setQuery,
      goToSearch: () => navigate("/search"),
      goToGoalOnboarding: () => navigate("/goals/onboarding"),
      goToNotifications: () => navigate("/notifications"),
      goToGoals: () => navigate("/goals"),
    },
  }
}
