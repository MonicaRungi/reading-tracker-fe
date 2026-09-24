import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BookCard } from "@/components/shared/BookCard";
import { BookCardSkeleton } from "@/components/shared/BookCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { LibraryItem } from "@/api/library";
import type { LibraryFilter } from "../hooks/useLibraryData";

export function LibraryGrid({
  items,
  isLoading,
  filter,
}: {
  items: LibraryItem[];
  isLoading: boolean;
  filter: LibraryFilter;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-x-4 gap-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0 && filter !== "all") {
    return (
      <EmptyState
        icon={BookOpen}
        title={t("library.emptyFilter")}
        description={t("library.emptyFilterSub")}
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-5">
      {items.map((item) => (
        <BookCard key={item.id} item={item} />
      ))}
    </div>
  );
}
