import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { BookMeta } from "@/api/books";
import { Button } from "@/components/ui/button";

export function BookMetaDetails({ book }: { book: BookMeta }) {
  const { t } = useTranslation();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const metaLine = [
    book.publisher,
    book.published_year?.toString(),
    book.page_count ? `${book.page_count} ${t("bookDetail.pages")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (!metaLine && !book.description && !book.genres?.length) return null;

  return (
    <div className="mb-5 space-y-2">
      {metaLine && (
        <p className="text-[12px] text-muted-foreground">{metaLine}</p>
      )}

      {!!book.genres?.length && (
        <div className="flex flex-wrap gap-1.5">
          {book.genres.map((genre) => (
            <Badge key={genre} variant="secondary" className="rounded-full">
              {genre}
            </Badge>
          ))}
        </div>
      )}

      {book.description && (
        <div>
          <p
            className={
              descriptionExpanded
                ? "text-[13px] leading-relaxed text-foreground/80"
                : "line-clamp-4 text-[13px] leading-relaxed text-foreground/80"
            }
          >
            {book.description}
          </p>
          <Button
            variant="link"
            onClick={() => setDescriptionExpanded((v) => !v)}
            className="mt-1 text-[12px] font-medium text-primary"
          >
            {descriptionExpanded ? t("search.showLess") : t("search.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
