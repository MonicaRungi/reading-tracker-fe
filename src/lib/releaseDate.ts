import { toISODate } from "@/lib/format";

const FULL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Solo una data a granularità giorno abilita il promemoria (niente finta precisione). */
export function isFullDate(value: string | null | undefined): value is string {
  return typeof value === "string" && FULL_DATE.test(value);
}

/** Data di uscita completa e nel futuro: si può offrire il promemoria. */
export function upcomingReleaseDate(
  publishedDate: string | null | undefined,
  date: Date = new Date(),
): string | null {
  return isFullDate(publishedDate) && publishedDate > toISODate(date)
    ? publishedDate
    : null;
}
