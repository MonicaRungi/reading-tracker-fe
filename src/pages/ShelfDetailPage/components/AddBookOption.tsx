import { BookOpen } from "lucide-react";
import type { LibraryItem } from "@/api/library";
import { Checkbox } from "@/components/ui/checkbox";
import { formatAuthors } from "@/lib/format";

/** Riga selezionabile della libreria nello sheet "Aggiungi libri". */
export function AddBookOption({
  item,
  checked,
  onToggle,
}: {
  item: LibraryItem;
  checked: boolean;
  onToggle: () => void;
}) {
  const id = `add-book-${item.id}`;

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 active:bg-secondary"
    >
      <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
        {item.book.cover_url ? (
          <img src={item.book.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-foreground">{item.book.title}</p>
        <p className="truncate text-[12px] text-muted-foreground">
          {formatAuthors(item.book.authors)}
        </p>
      </div>
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} className="size-5" />
    </label>
  );
}
