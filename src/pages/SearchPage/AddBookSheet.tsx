import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { Button } from "@/components/ui/button";
import type { BookMeta } from "@/api/books";
import type { ReadingStatus } from "@/api/library";
import { SelectedBookSummary } from "./components/SelectedBookSummary";
import { BookMetaDetails } from "./components/BookMetaDetails";
import { ReadingStatusPicker } from "./components/ReadingStatusPicker";
import { ReleaseReminderCard } from "@/components/shared/ReleaseReminderCard";

interface AddBookSheetProps {
  book: BookMeta | null;
  status: ReadingStatus;
  onStatusChange: (status: ReadingStatus | "") => void;
  /** Data di uscita futura e completa: abilita il promemoria. */
  releaseDate: string | null;
  remindRelease: boolean;
  onToggleRemindRelease: () => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function AddBookSheet({
  book,
  status,
  onStatusChange,
  releaseDate,
  remindRelease,
  onToggleRemindRelease,
  isSubmitting,
  onSubmit,
  onClose,
}: AddBookSheetProps) {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLDivElement>(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);

  // Mostra il titolo nell'header sticky solo quando il titolo grande dentro
  // SelectedBookSummary è scrollato fuori dalla vista — altrimenti sarebbe
  // una ripetizione inutile mentre è già visibile.
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const titleHeight = titleRef.current?.offsetHeight ?? 0;
    setShowStickyTitle(e.currentTarget.scrollTop > titleHeight);
  }

  if (!book) return null;

  return (
    <Sheet open={!!book} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent
        className="flex max-h-[85vh] flex-col"
      >
        <div className="shrink-0 border-b border-border px-5 pb-4">
          <h2 className="pr-8 text-[20px] font-bold text-foreground">
            {t("search.addBook")}
          </h2>
          {showStickyTitle && (
            <p className="mt-1 truncate pr-8 text-[13px] text-muted-foreground">
              {book.title}
            </p>
          )}
        </div>

        <div
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4"
        >
          <div ref={titleRef}>
            <SelectedBookSummary book={book} />
          </div>
          <BookMetaDetails book={book} />

          <p className="mb-3 text-[13px] font-bold text-foreground">
            {t("search.readingStatus")}
          </p>
          <ReadingStatusPicker value={status} onChange={onStatusChange} />

          {releaseDate && (
            <ReleaseReminderCard
              releaseDate={releaseDate}
              active={remindRelease}
              onToggle={onToggleRemindRelease}
            />
          )}
        </div>

        <div className="shrink-0 border-t border-border px-5 pb-4 pt-3">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-auto w-full rounded-xl py-[15px] text-[15px] font-medium disabled:opacity-60"
          >
            {isSubmitting ? t("common.loading") : t("search.addToLibrary")}
          </Button>
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
