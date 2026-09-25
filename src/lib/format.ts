import { format } from "date-fns"

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const numberFormatter = new Intl.NumberFormat("it-IT")

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
