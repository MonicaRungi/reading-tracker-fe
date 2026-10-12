import { useState } from "react";
import { useTranslation } from "react-i18next";
import { it } from "date-fns/locale";
import { Sheet } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarHeader } from "../components/CalendarHeader";
import { MonthGrid } from "../components/MonthGrid";
import { YearGrid } from "../components/YearGrid";
import { useMonthYearPicker } from "../hooks/useMonthYearPicker";

interface DatePickerSheetProps {
  open: "started" | "finished" | null;
  startedAt: string | null;
  finishedAt: string | null;
  onClose: () => void;
  onSave: (field: "started" | "finished", date: string) => void;
}

export function DatePickerSheet({
  open,
  startedAt,
  finishedAt,
  onClose,
  onSave,
}: DatePickerSheetProps) {
  const { t } = useTranslation();
  const currentValue = open === "started" ? startedAt : finishedAt;
  const label =
    open === "started"
      ? t("bookDetail.startedDateLabel")
      : t("bookDetail.finishedDateLabel");

  // Bozza della data scelta nel calendario: null = nessuna modifica, si mostra
  // il valore salvato. Si azzera alla chiusura, così a ogni apertura lo sheet
  // riparte dalla data del campo interessato.
  const [draft, setDraft] = useState<Date | undefined | null>(null);
  const selected =
    draft !== null ? draft : currentValue ? new Date(currentValue) : undefined;
  const picker = useMonthYearPicker(selected);
  const { shownMonth, firstYear } = picker.data;
  const { view } = picker.ui;

  function close() {
    setDraft(null);
    picker.actions.reset();
    onClose();
  }

  function handleSave() {
    if (!selected || !open) return;
    // Formato YYYY-MM-DD senza problemi di timezone
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    onSave(open, `${yyyy}-${mm}-${dd}`);
    close();
  }

  return (
    <Sheet open={open !== null} onOpenChange={(next) => !next && close()}>
      <BottomSheetContent
        className="px-5"
      >
        <h2 className="mb-5 pr-8 text-[20px] font-bold text-foreground">
          {label}
        </h2>

        <CalendarHeader
          month={shownMonth}
          isPickerOpen={view !== "days"}
          onPrevious={picker.actions.previousMonth}
          onNext={picker.actions.nextMonth}
          onTogglePicker={picker.actions.togglePicker}
        />

        {/* mesi e anni coprono i giorni senza cambiare l'altezza dello sheet */}
        <div className="relative mb-4">
          <div
            inert={view !== "days"}
            className={cn("transition-opacity duration-200", view !== "days" && "opacity-0")}
          >
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setDraft}
              month={shownMonth}
              onMonthChange={picker.actions.goToMonth}
              hideNavigation
              locale={it}
              disabled={
                open === "finished" && startedAt
                  ? { before: new Date(startedAt) }
                  : undefined
              }
              className="p-0"
              classNames={{
                month_caption: "hidden",
                day: "group/day relative aspect-square h-full w-full rounded-full p-0 text-center select-none [&>button]:rounded-full",
                selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
                today: "text-primary font-semibold",
              }}
            />
          </div>

          {view !== "days" && (
            <div
              key={view}
              className="absolute inset-x-0 top-0 animate-in fade-in zoom-in-95 duration-200"
            >
              {view === "months" ? (
                <MonthGrid
                  year={shownMonth.getFullYear()}
                  selectedMonth={shownMonth.getMonth()}
                  onChooseMonth={picker.actions.chooseMonth}
                  onOpenYears={picker.actions.openYears}
                />
              ) : (
                <YearGrid
                  firstYear={firstYear}
                  selectedYear={shownMonth.getFullYear()}
                  onChooseYear={picker.actions.chooseYear}
                  onPrevious={picker.actions.previousYears}
                  onNext={picker.actions.nextYears}
                />
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={!selected}
          className="mb-4 h-auto w-full rounded-xl py-[15px] text-[15px] font-medium disabled:opacity-60"
        >
          {t("bookDetail.confirmDate")}
        </Button>
      </BottomSheetContent>
    </Sheet>
  );
}
