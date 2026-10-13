import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

/** Vista mesi: i 12 mesi dell'anno in 3×4; l'anno in alto apre la vista anni. */
export function MonthGrid({
  year,
  selectedMonth,
  onChooseMonth,
  onOpenYears,
}: {
  year: number;
  /** Mese evidenziato (0–11). */
  selectedMonth: number;
  onChooseMonth: (month: number) => void;
  onOpenYears: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-popover p-4 shadow-[0_8px_24px_rgb(0_0_0/10%)]">
      <button
        type="button"
        onClick={onOpenYears}
        aria-label={t("bookDetail.datePicker.chooseYear", { year })}
        className="mb-3 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[16px] font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        {year}
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        {MONTHS.map((month) => {
          const isSelected = month === selectedMonth;
          return (
            <button
              key={month}
              type="button"
              onClick={() => onChooseMonth(month)}
              aria-pressed={isSelected}
              aria-label={format(new Date(year, month), "LLLL yyyy", { locale: it })}
              className={cn(
                "h-10 rounded-full text-[15px] text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {format(new Date(year, month), "LLL", { locale: it })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
