import { formatAuthors } from "@/lib/format";
import type { BookMeta } from "@/api/books";

export function SelectedBookSummary({ book }: { book: BookMeta }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-[52px] w-[36px] shrink-0 overflow-hidden rounded-md bg-muted">
        {book.cover_url && (
          <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-foreground">{book.title}</p>
        <p className="truncate text-[13px] text-muted-foreground">
          {formatAuthors(book.authors)}
        </p>
      </div>
    </div>
  );
}
