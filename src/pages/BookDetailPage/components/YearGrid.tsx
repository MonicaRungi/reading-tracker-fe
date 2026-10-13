import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { YEARS_PER_PAGE } from "../hooks/useMonthYearPicker";

/** Vista anni: 12 anni in 3×4, con le frecce per le dozzine prima e dopo. */
export function YearGrid({
  firstYear,
  selectedYear,
  onChooseYear,
  onPrevious,
  onNext,
}: {
  firstYear: number;
  selectedYear: number;
  onChooseYear: (year: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => firstYear + i);
  const arrow =
    "flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <div className="rounded-2xl bg-popover p-4 shadow-[0_8px_24px_rgb(0_0_0/10%)]">
      <div className="mb-3 flex items-center justify-between pl-2">
        <span className="text-[16px] font-semibold text-foreground">
          {t("bookDetail.datePicker.selectYear")}
        </span>
        <div className="flex">
          <button type="button" onClick={onPrevious} aria-label={t("bookDetail.datePicker.previousYears")} className={arrow}>
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={onNext} aria-label={t("bookDetail.datePicker.nextYears")} className={arrow}>
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        {years.map((year) => {
          const isSelected = year === selectedYear;
          return (
            <button
              key={year}
              type="button"
              onClick={() => onChooseYear(year)}
              aria-pressed={isSelected}
              className={cn(
                "h-10 rounded-full text-[15px] tabular-nums text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
