import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Shelf } from "@/api/shelves";
import { Button } from "@/components/ui/button";
import { ShelfPreview } from "./ShelfPreview";

export function ShelfCard({
  shelf,
  onOpen,
  onOpenMenu,
}: {
  shelf: Shelf;
  onOpen: () => void;
  onOpenMenu: () => void;
}) {
  const { t } = useTranslation();

  return (
    // angoli superiori più stretti: seguono la cornice dell'anteprima
    <article className="overflow-hidden rounded-2xl rounded-t-[10px] bg-card shadow-card">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={shelf.name}
      >
        <ShelfPreview theme={shelf.color_theme} books={shelf.preview} />
      </button>
      <div className="flex items-center gap-2 py-2 pl-4 pr-2">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="truncate text-[15px] font-semibold text-foreground">{shelf.name}</p>
          <p className="text-[12px] text-muted-foreground">
            {shelf.book_count > 0
              ? t("library.bookCount", { count: shelf.book_count })
              : t("shelves.previewEmpty")}
          </p>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label={t("shelves.openMenu", { name: shelf.name })}
          className="rounded-full text-muted-foreground"
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </div>
    </article>
  );
}
