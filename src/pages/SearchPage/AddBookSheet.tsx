import { useTranslation } from "react-i18next";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { BookMeta } from "@/api/books";
import type { ReadingStatus } from "@/api/library";
import type { Shelf } from "@/api/shelves";
import { SelectedBookSummary } from "./components/SelectedBookSummary";
import { ReadingStatusPicker } from "./components/ReadingStatusPicker";
import { ShelfPicker } from "./components/ShelfPicker";

interface AddBookSheetProps {
  book: BookMeta | null;
  status: ReadingStatus;
  onStatusChange: (status: ReadingStatus | "") => void;
  shelves: Shelf[];
  selectedShelfIds: string[];
  onSelectedShelfIdsChange: (ids: string[]) => void;
  isAddingShelf: boolean;
  newShelfName: string;
  onNewShelfNameChange: (name: string) => void;
  onStartAddingShelf: () => void;
  onConfirmNewShelf: () => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function AddBookSheet({
  book,
  status,
  onStatusChange,
  shelves,
  selectedShelfIds,
  onSelectedShelfIdsChange,
  isAddingShelf,
  newShelfName,
  onNewShelfNameChange,
  onStartAddingShelf,
  onConfirmNewShelf,
  isSubmitting,
  onSubmit,
  onClose,
}: AddBookSheetProps) {
  const { t } = useTranslation();

  if (!book) return null;

  return (
    <Sheet open={!!book} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-[22px] px-5 pb-safe pt-2">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />

        <h2 className="mb-5 pr-8 text-[20px] font-bold text-foreground">
          {t("search.addBook")}
        </h2>

        <SelectedBookSummary book={book} />

        <p className="mb-3 text-[13px] font-bold text-foreground">
          {t("search.readingStatus")}
        </p>
        <ReadingStatusPicker value={status} onChange={onStatusChange} />

        <p className="mb-3 text-[13px] font-bold text-foreground">{t("search.shelves")}</p>
        <ShelfPicker
          shelves={shelves}
          selectedIds={selectedShelfIds}
          onSelectedIdsChange={onSelectedShelfIdsChange}
          isAddingShelf={isAddingShelf}
          newShelfName={newShelfName}
          onNewShelfNameChange={onNewShelfNameChange}
          onStartAddingShelf={onStartAddingShelf}
          onConfirmNewShelf={onConfirmNewShelf}
        />

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="mb-4 h-auto w-full rounded-xl py-[15px] text-[15px] font-medium disabled:opacity-60"
        >
          {isSubmitting ? t("common.loading") : t("search.addToLibrary")}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
