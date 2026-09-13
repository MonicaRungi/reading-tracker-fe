import type { BookRow } from "@/types/database.types"

export type BookSource = "google_books" | "open_library"

/**
 * Formato normalizzato restituito dalle Edge Function.
 * snake_case perché è JSON puro, non passa dal client Supabase.
 */
export interface BookMeta {
  isbn13: string | null
  title: string | null
  authors: string[] | null
  cover_url: string | null
  page_count: number | null
  published_year: number | null
  publisher: string | null
  description: string | null
  genres: string[] | null
  source: BookSource
}

/**
 * Libro dal DB — è esattamente il Row generato da Supabase.
 * Usiamo direttamente BookRow: niente mapping manuale.
 */
export type Book = BookRow