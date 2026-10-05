import type { BookRow, LibraryItemRow } from "@/types/database.types"

/** Tema colore della mensola: indipendente dal dark mode dell'app. */
export type ShelfTheme = "wood" | "white" | "night" | "sage" | "lilac" | "terracotta"

/** Quanto basta di un libro per disegnarne il dorso (e la copertina, se sta di fronte). */
export type SpineBook = Pick<BookRow, "id" | "title" | "authors" | "page_count" | "cover_url">

/**
 * Come sta il libro su quello scaffale: in piedi (dorso), sdraiato (i sdraiati
 * consecutivi formano una pila) o di fronte (copertina).
 */
export type ShelfItemDisplay = "spine" | "stack" | "cover"

/** Un libro posato su uno scaffale, nell'ordine della mensola. */
export interface ShelfBook {
  shelf_item_id: string
  position: number
  display: ShelfItemDisplay
  library_item: Pick<LibraryItemRow, "id" | "spine_path" | "spine_ratio"> & {
    book: SpineBook
  }
}

/** Scaffale nell'elenco: conteggio + i primi libri per l'anteprima a mensola. */
export interface Shelf {
  id: string
  name: string
  color_theme: ShelfTheme
  book_count: number
  preview: ShelfBook[]
}

/** Scaffale aperto: tutti i libri, ordinati per `position`. */
export interface ShelfDetail {
  id: string
  name: string
  color_theme: ShelfTheme
  books: ShelfBook[]
}

export interface ShelfInput {
  name: string
  color_theme: ShelfTheme
}
