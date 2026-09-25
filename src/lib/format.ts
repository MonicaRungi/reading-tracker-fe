import { format } from "date-fns"

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const weekdayFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

const dayMonthFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
})

const numberFormatter = new Intl.NumberFormat("it-IT")

/** 'YYYY-MM-DD' interpretato come data locale (new Date('YYYY-MM-DD') sarebbe UTC). */
function parseCalendarDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** "lunedì 29 settembre" */
export function formatWeekdayDate(value: string): string {
  return weekdayFormatter.format(parseCalendarDate(value))
}

/** "28 settembre" */
export function formatDayMonth(value: string): string {
  return dayMonthFormatter.format(parseCalendarDate(value))
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return dateFormatter.format(date)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatAuthors(authors: string[] | null): string {
  return authors && authors.length > 0 ? authors.join(", ") : ""
}

/**
 * Data di calendario 'YYYY-MM-DD' nel fuso locale dell'utente.
 * Non usare toISOString(): è in UTC e dopo la mezzanotte italiana restituisce
 * ancora il giorno prima (libri finiti "ieri", obiettivi dell'anno sbagliato).
 */
export function toISODate(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd")
}
