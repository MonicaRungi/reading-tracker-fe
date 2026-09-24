import { Search, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { ReadingStatus } from "@/api/library";
import type { SearchResult } from "../hooks/useSearchData";
import { SearchResultItem } from "./SearchResultItem";

export function SearchResults({
  isLoading,
  hasQuery,
  results,
  onSelect,
}: {
  isLoading: boolean;
  hasQuery: boolean;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasQuery) {
    return (
      <EmptyState
        icon={Search}
        title={t("search.emptyInitial")}
        description={t("search.emptyInitialSub")}
      />
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t("search.emptyResults")}
        description={t("search.emptyResultsSub")}
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {results.map((result, index) => (
        <SearchResultItem
          key={result.book.isbn13 ?? `${result.book.title}-${index}`}
          book={result.book}
          libraryStatus={
            (result.libraryItem?.status as ReadingStatus | undefined) ?? null
          }
          onSelect={() => onSelect(result)}
        />
      ))}
    </ul>
  );
}
