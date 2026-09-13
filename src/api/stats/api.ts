import { supabase } from "@/lib/supabase"
import type { Stats } from "./types"

export async function getStats(): Promise<Stats> {
  const [readItems, logRows] = await Promise.all([
    supabase
      .from("library_items")
      .select("finished_at, book:books(genres)")
      .eq("status", "read"),
    supabase
      .from("reading_log")
      .select("pages_read"),
  ])

  if (readItems.error) throw readItems.error
  if (logRows.error) throw logRows.error

  const total_books_read = readItems.data.length
  const total_pages_read = logRows.data.reduce((sum, r) => sum + r.pages_read, 0)

  const byYear = new Map<number, number>()
  for (const item of readItems.data) {
    if (!item.finished_at) continue
    const year = new Date(item.finished_at).getFullYear()
    byYear.set(year, (byYear.get(year) ?? 0) + 1)
  }
  const books_by_year = [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year, count }))

  const genreCounts = new Map<string, number>()
  let total = 0
  for (const item of readItems.data) {
    const book = item.book as { genres: string[] | null } | null
    for (const g of book?.genres ?? []) {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1)
      total++
    }
  }
  const genres = [...genreCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([genre, count]) => ({ genre, percent: total > 0 ? count / total : 0 }))

  return { total_books_read, total_pages_read, books_by_year, genres }
}