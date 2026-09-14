import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatAuthors } from "@/lib/format";
import type { BookMeta } from "@/api/books";

export function SearchResultItem({
  book,
  onAdd,
}: {
  book: BookMeta;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  return (
    <li className="flex items-center gap-3 py-3.5">
      <div className="h-[60px] w-[40px] shrink-0 overflow-hidden rounded-md bg-secondary">
        {book.cover_url ? (
          <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground">
          {book.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {formatAuthors(book.authors)}
        </p>
      </div>

      <Button
        variant="outline"
        onClick={onAdd}
        className="h-auto shrink-0 rounded-full border-primary px-4 py-1.5 text-[12px] text-primary active:bg-accent"
      >
        {t("search.add")}
      </Button>
    </li>
  );
}
