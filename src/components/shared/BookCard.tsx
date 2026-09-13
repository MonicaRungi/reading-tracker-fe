import { BookOpen } from "lucide-react"
import type { LibraryItem } from "@/api/library"
import { formatAuthors } from "@/lib/format"
import { StatusBadge } from "./StatusBadge"

export function BookCard({ item }: { item: LibraryItem }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-muted">
        {item.book.coverUrl ? (
          <img
            src={item.book.coverUrl}
            alt={item.book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="size-8 text-hint" aria-hidden="true" />
          </div>
        )}
        <StatusBadge status={item.status} className="absolute top-2 left-2" />
      </div>
      <div>
        <p className="truncate text-sm font-medium text-foreground">{item.book.title}</p>
        <p className="truncate text-xs text-muted-foreground">{formatAuthors(item.book.authors)}</p>
      </div>
    </div>
  )
}
