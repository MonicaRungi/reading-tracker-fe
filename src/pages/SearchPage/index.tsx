import { BookOpen, Search as SearchIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { SearchBar } from "@/components/shared/SearchBar"
import { useSearchData } from "./hooks/useSearchData"

export default function SearchPage() {
  const { t } = useTranslation()
  const { data, ui, actions } = useSearchData()

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-foreground">{t("search.title")}</h1>

      <SearchBar value={ui.query} onChange={actions.setQuery} />

      {data.isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {!data.isLoading && data.hasQuery && data.results.length === 0 && (
        <EmptyState icon={SearchIcon} title={t("search.empty")} />
      )}

      {!data.isLoading && data.results.length > 0 && (
        <ul className="space-y-3">
          {data.results.map((book) => (
            <li key={book.id} className="flex items-center gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="size-6 text-hint" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{book.title}</p>
                <p className="truncate text-xs text-muted-foreground">{book.author}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
