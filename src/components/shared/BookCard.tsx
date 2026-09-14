import { BookOpen } from "lucide-react";
import type { LibraryItem } from "@/api/library";
import { formatAuthors } from "@/lib/format";
import { useNavigate } from "react-router-dom";

export function BookCard({ item }: { item: LibraryItem }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col gap-2 cursor-pointer"
      onClick={() => navigate(`/book/${item.id}`)}
    >
      {/* Copertina verticale 2:3 */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#F1EFEC]">
        {item.book.cover_url ? (
          <img
            src={item.book.cover_url}
            alt={item.book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="size-8 text-[#938C84]" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="line-clamp-2 text-[12px] font-medium leading-tight text-foreground">
          {item.book.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#938C84]">
          {formatAuthors(item.book.authors)}
        </p>
      </div>
    </div>
  );
}
