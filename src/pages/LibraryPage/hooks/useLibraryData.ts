import { useState } from "react"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { listLibraryPage } from "@/api/library"
import { getGoalsProgress, listGoals } from "@/api/goals"
import { findPrimaryGoalForYear } from "@/lib/goals"
import { getBooleanPreference, setBooleanPreference } from "@/lib/preferences"
import { useAuth } from "@/hooks/useAuth"
import { useDebounce } from "@/hooks/useDebounce"
import { useNotifications } from "@/hooks/useNotifications"
import type { ReadingStatus } from "@/api/library"

export type LibraryFilter = "all" | ReadingStatus

const PAGE_SIZE = 30 // multiplo delle 3 colonne della griglia
const READING_LIMIT = 20
const GOAL_OPEN_KEY = "rt.libraryGoalOpen"

export function useLibraryData() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? ""
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [query, setQuery] = useState("")
  const [isGoalOpen, setIsGoalOpen] = useState(() =>
    getBooleanPreference(GOAL_OPEN_KEY, true),
  )
  const { unreadCount } = useNotifications()

  const debouncedQuery = useDebounce(query.trim(), 300)

  // Le chiavi iniziano con ["library", userId]: le mutation che invalidano
  // quel prefisso aggiornano anche griglia, conteggi e "Continua a leggere".
  const gridQuery = useInfiniteQuery({
    queryKey: ["library", userId, "page", filter, debouncedQuery],
    queryFn: ({ pageParam }) =>
      listLibraryPage({
        status: filter === "all" ? undefined : filter,
        query: debouncedQuery,
        offset: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0)
      return loaded < lastPage.total ? loaded : undefined
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
  })

  const { data: readingPage } = useQuery({
    queryKey: ["library", userId, "reading"],
    queryFn: () =>
      listLibraryPage({ status: "reading", offset: 0, limit: READING_LIMIT }),
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

  const grid = gridQuery.data?.pages.flatMap((page) => page.items) ?? []
  const reading = readingPage?.items ?? []
  // Totale filtrato (stato + ricerca) restituito dalla stessa chiamata paginata.
  const total = gridQuery.data?.pages[0]?.total
  // La libreria è "vuota" solo se lo è senza filtri né ricerca.
  const isEmpty =
    filter === "all" && !debouncedQuery && !gridQuery.isPlaceholderData && total === 0

  return {
    data: {
      reading,
      grid,
      total,
      isLoading: gridQuery.isLoading,
      isError: gridQuery.isError,
      isEmpty,
      hasNextPage: gridQuery.hasNextPage,
      isFetchingNextPage: gridQuery.isFetchingNextPage,
      year,
      primaryGoal,
      primaryGoalCurrent,
      isLoadingGoals,
      unreadNotifications: unreadCount,
    },
    ui: { filter, query, isGoalOpen },
    actions: {
      setFilter: (next: LibraryFilter | "") => next && setFilter(next),
      setQuery,
      setGoalOpen: (open: boolean) => {
        setIsGoalOpen(open)
        setBooleanPreference(GOAL_OPEN_KEY, open)
      },
      loadMore: () => {
        if (gridQuery.hasNextPage && !gridQuery.isFetchingNextPage) {
          void gridQuery.fetchNextPage()
        }
      },
      goToSearch: () => navigate("/search"),
      goToGoalOnboarding: () => navigate("/goals/onboarding"),
      goToNotifications: () => navigate("/notifications"),
      goToGoals: () => navigate("/goals"),
    },
  }
}
