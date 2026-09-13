import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchBooks } from "@/api/books"

export function useSearchData() {
  const [query, setQuery] = useState("")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", "search", query],
    queryFn: () => searchBooks(query),
    enabled: query.trim().length >= 2,
  })

  return {
    data: { results: data ?? [], isLoading, isError, hasQuery: query.trim().length >= 2 },
    ui: { query },
    actions: { setQuery },
  }
}
