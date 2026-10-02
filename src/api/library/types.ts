import type { LibraryItemRow, BookRow } from "@/types/database.types"

export type ReadingStatus = "to_read" | "reading" | "read" | "abandoned"

/**
 * LibraryItem con il book joinato — quello che usiamo nella UI.
 * Entrambi in snake_case, tipi dal DB.
 */
export interface LibraryItem extends LibraryItemRow {
  book: BookRow
}

export interface LibraryPageParams {
  status?: ReadingStatus
  query?: string
  offset: number
  limit: number
}

/** Una pagina della libreria + il totale delle righe che matchano i filtri. */
export interface LibraryPage {
  items: LibraryItem[]
  total: number
}

export interface AddLibraryItemInput {
  book: import("@/api/books").BookMeta
  status: ReadingStatus
  shelf_ids: string[]
}