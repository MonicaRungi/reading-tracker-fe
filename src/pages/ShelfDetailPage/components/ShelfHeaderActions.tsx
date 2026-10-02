import { MoreHorizontal, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/** Azioni a destra nell'header del dettaglio: aggiungi libri e menu ⋯. */
export function ShelfHeaderActions({
  shelfName,
  onAddBooks,
  onOpenMenu,
}: {
  shelfName: string;
  onAddBooks: () => void;
  onOpenMenu: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddBooks}
        aria-label={t("shelves.detail.addBooks")}
        className="rounded-full text-primary"
      >
        <Plus className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        aria-label={t("shelves.openMenu", { name: shelfName })}
        className="rounded-full text-muted-foreground"
      >
        <MoreHorizontal className="size-5" />
      </Button>
    </div>
  );
}
