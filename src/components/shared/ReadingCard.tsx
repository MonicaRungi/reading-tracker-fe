import { BookOpen } from "lucide-react";
import type { LibraryItem } from "@/api/library";
import { formatAuthors } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { useNavigate } from "react-router-dom";

export function ReadingCard({
  item,
  fullWidth = false,
  ref,
}: {
  item: LibraryItem;
  fullWidth?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const navigate = useNavigate();
  const pageCount = item.book.page_count;
  const percent =
    pageCount && item.current_page
      ? Math.min(100, Math.round((item.current_page / pageCount) * 100))
      : 0;

  return (
    <div
      ref={ref}
      className={cn(
        "flex shrink-0 snap-start items-center gap-4 rounded-[16px] border border-border bg-accent p-3",
        fullWidth ? "w-full" : "w-[86%]",
      )}
      onClick={() => navigate(`/book/${item.id}`)}
    >
      {/* Copertina */}
      <div className="h-[144px] w-[92px] shrink-0 overflow-hidden rounded-[10px] bg-secondary">
        {item.book.cover_url ? (
          <img
            src={item.book.cover_url}
            alt={item.book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] font-semibold leading-tight text-foreground">
          {item.book.title}
        </p>
        <p className="mt-1 truncate text-[13px] text-muted-foreground">
          {formatAuthors(item.book.authors)}
        </p>

        {/* Progress */}
        <div className="mt-2">
          <ProgressBar percent={percent} />
          <p className="mt-1 text-[12px] text-muted-foreground">
            {item.current_page} / {pageCount ?? "?"} · {percent}%
          </p>
        </div>
      </div>
    </div>
  );
}
