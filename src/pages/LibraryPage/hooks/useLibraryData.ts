import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { listLibrary } from "@/api/library"
import { useAuth } from "@/hooks/useAuth"
import type { ReadingStatus } from "@/api/library"

export type LibraryFilter = "all" | ReadingStatus

export function useLibraryData() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? ""
  const [filter, setFilter] = useState<LibraryFilter>("all")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", userId],
    queryFn: () => listLibrary(),
    enabled: Boolean(userId),
  })

  const items = data ?? []
  const reading = items.filter((item) => item.status === "reading")
  const grid = filter === "all"
    ? items
    : items.filter((item) => item.status === filter)
  const isEmpty = !isLoading && items.length === 0

  return {
    data: { reading, grid, items, isLoading, isError, isEmpty },
    ui: { filter },
    actions: {
      setFilter: (next: LibraryFilter | "") => next && setFilter(next),
      goToSearch: () => navigate("/search"),
    },
  }
}
