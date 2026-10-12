import { useState } from "react";
import { addMonths, startOfMonth } from "date-fns";

export type DatePickerView = "days" | "months" | "years";

/** Anni per pagina nella griglia degli anni (3×4). */
export const YEARS_PER_PAGE = 12;
/** Posizione dell'anno mostrato nella prima pagina: seconda riga, come nel design. */
const YEAR_OFFSET_IN_PAGE = 3;

/**
 * Navigazione del calendario delle date di lettura: mese mostrato e vista
 * (giorni, mesi, anni). Scegliere mese o anno non chiude lo sheet: si torna ai
 * giorni e si conferma solo dopo aver scelto il giorno.
 * `initialMonth` è il mese da cui partire finché non si naviga.
 */
export function useMonthYearPicker(initialMonth: Date | undefined) {
  const [month, setMonth] = useState<Date | null>(null);
  const [view, setView] = useState<DatePickerView>("days");
  const [firstYear, setFirstYear] = useState(0);
  const shownMonth = month ?? startOfMonth(initialMonth ?? new Date());

  return {
    data: { shownMonth, firstYear },
    ui: { view },
    actions: {
      goToMonth: (next: Date) => setMonth(startOfMonth(next)),
      previousMonth: () => setMonth(addMonths(shownMonth, -1)),
      nextMonth: () => setMonth(addMonths(shownMonth, 1)),
      togglePicker: () => setView((current) => (current === "days" ? "months" : "days")),
      openYears: () => {
        setFirstYear(shownMonth.getFullYear() - YEAR_OFFSET_IN_PAGE);
        setView("years");
      },
      previousYears: () => setFirstYear((year) => year - YEARS_PER_PAGE),
      nextYears: () => setFirstYear((year) => year + YEARS_PER_PAGE),
      chooseYear: (year: number) => {
        setMonth(new Date(year, shownMonth.getMonth()));
        setView("months");
      },
      chooseMonth: (monthIndex: number) => {
        setMonth(new Date(shownMonth.getFullYear(), monthIndex));
        setView("days");
      },
      /** Alla chiusura dello sheet: la prossima apertura riparte dalla data del campo. */
      reset: () => {
        setMonth(null);
        setView("days");
      },
    },
  };
}
