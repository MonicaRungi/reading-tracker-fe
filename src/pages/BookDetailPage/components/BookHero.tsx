import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatAuthors } from "@/lib/format";
import type { LibraryItem } from "@/api/library";
import type { ReadingStatus } from "@/api/library";

export function BookHero({ item }: { item: LibraryItem }) {
  const { t } = useTranslation();

  const metaParts = [
    item.book.genres?.[0],
    item.book.page_count ? `${item.book.page_count} ${t("bookDetail.pages")}` : null,
    item.book.published_year,
    item.book.publisher,
  ].filter(Boolean);

  return (
    <div className="flex gap-4">
      <div className="h-[144px] w-[96px] shrink-0 overflow-hidden rounded-xl bg-secondary shadow-sm">
        {item.book.cover_url ? (
          <img
            src={item.book.cover_url}
            alt={item.book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <h1 className="text-[20px] font-bold leading-tight text-foreground">
          {item.book.title}
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {formatAuthors(item.book.authors)}
        </p>

        {metaParts.length > 0 && (
          <p className="mt-2 text-[12px] leading-relaxed text-hint">
            {metaParts.join(" · ")}
          </p>
        )}

        <StatusBadge status={item.status as ReadingStatus} className="mt-3" />
      </div>
    </div>
  );
}
