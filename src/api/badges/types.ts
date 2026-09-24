import type { BadgeRow, UserBadgeRow } from "@/types/database.types"

export type BadgeCategory = "annual" | "books" | "pages" | "long_books" | "goals"
export type BadgeTier = "iniziale" | "bronzo" | "argento" | "oro"
export type BadgeMetric =
  | "books_completed"
  | "pages_read"
  | "longest_book_pages"
  | "goals_completed"

export interface Badge
  extends Omit<BadgeRow, "category" | "tier" | "metric" | "created_at"> {
  category: BadgeCategory
  tier: BadgeTier | null
  metric: BadgeMetric | null
}

export type UserBadge = UserBadgeRow

/** Catalogo + stato di sblocco per l'utente corrente. */
export interface BadgeWithStatus extends Badge {
  unlocked: boolean
  unlocked_at: string | null
  is_featured: boolean
  progress: number | null // 0-1, null per i badge binari (annuali)
  current: number | null // valore corrente della metrica, null per gli annuali
}

/** Valori correnti delle metriche su cui si basano le soglie. */
export type UserProgress = Record<BadgeMetric, number>

/** Avanzamento mostrato nel dettaglio di un badge a soglia. */
export interface BadgeProgressInfo {
  metric: BadgeMetric
  current: number
  target: number
}
