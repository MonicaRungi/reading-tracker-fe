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
  const [query, setQuery] = useState("")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", userId],
    queryFn: () => listLibrary(),
    enabled: Boolean(userId),
  })

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
    data: { reading, grid, items, isLoading, isError, isEmpty },
    ui: { filter, query },
    actions: {
      setFilter: (next: LibraryFilter | "") => next && setFilter(next),
      setQuery,
      goToSearch: () => navigate("/search"),
    },
  }
}
