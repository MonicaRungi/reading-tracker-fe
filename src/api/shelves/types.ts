import type { BookRow, LibraryItemRow } from "@/types/database.types"

/** Tema colore della mensola: indipendente dal dark mode dell'app. */
export type ShelfTheme = "wood" | "white" | "night" | "sage"

/** Quanto basta di un libro per disegnarne la costola. */
export type SpineBook = Pick<BookRow, "id" | "title" | "authors" | "page_count">

/** Un libro posato su uno scaffale, nell'ordine della mensola. */
export interface ShelfBook {
  shelf_item_id: string
  position: number
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
