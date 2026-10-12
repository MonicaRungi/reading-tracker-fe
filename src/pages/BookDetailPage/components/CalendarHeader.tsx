import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

/** Frecce del mese e pillola "ottobre 2026" che apre la scelta di mese e anno. */
export function CalendarHeader({
  month,
  isPickerOpen,
  onPrevious,
  onNext,
  onTogglePicker,
}: {
  month: Date;
  isPickerOpen: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePicker: () => void;
}) {
  const { t } = useTranslation();
  const arrow =
    "flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <div className="mb-3 flex items-center justify-between">
      <button type="button" onClick={onPrevious} aria-label={t("bookDetail.datePicker.previousMonth")} className={arrow}>
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onTogglePicker}
        aria-expanded={isPickerOpen}
        aria-label={t("bookDetail.datePicker.chooseMonth", { month: format(month, "LLLL yyyy", { locale: it }) })}
        className="flex h-11 items-center gap-2 rounded-full bg-secondary px-5 text-[16px] font-medium text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary"
      >
        {format(month, "LLLL yyyy", { locale: it })}
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", isPickerOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <button type="button" onClick={onNext} aria-label={t("bookDetail.datePicker.nextMonth")} className={arrow}>
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
