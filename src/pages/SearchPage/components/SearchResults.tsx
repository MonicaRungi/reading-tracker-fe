import { Search, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { BookMeta } from "@/api/books";
import { SearchResultItem } from "./SearchResultItem";

export function SearchResults({
  isLoading,
  hasQuery,
  results,
  onAddBook,
}: {
  isLoading: boolean;
  hasQuery: boolean;
  results: BookMeta[];
  onAddBook: (book: BookMeta) => void;
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
      {results.map((book, index) => (
        <SearchResultItem
          key={book.isbn13 ?? `${book.title}-${index}`}
          book={book}
          onAdd={() => onAddBook(book)}
        />
      ))}
    </ul>
  );
}
