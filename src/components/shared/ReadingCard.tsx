import { BookOpen } from "lucide-react"
import type { LibraryItem } from "@/api/library"
import { formatAuthors, formatPercent } from "@/lib/format"
import { ProgressBar } from "./ProgressBar"

export function ReadingCard({ item }: { item: LibraryItem }) {
  const pageCount = item.book.pageCount
  const percent = pageCount ? Math.min(100, (item.currentPage / pageCount) * 100) : 0

  return (
    <div className="flex w-[86%] shrink-0 snap-start items-center gap-3 rounded-xl bg-accent p-3">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {item.book.coverUrl ? (
          <img
            src={item.book.coverUrl}
            alt={item.book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <BookOpen className="size-6 text-hint" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.book.title}</p>
        <p className="truncate text-xs text-muted-foreground">{formatAuthors(item.book.authors)}</p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar percent={percent} />
          <span className="text-xs font-medium text-accent-foreground">
            {formatPercent(percent / 100)}
          </span>
        </div>
      </div>
    </div>
  )
}
