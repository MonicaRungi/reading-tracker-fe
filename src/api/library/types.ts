import type { LibraryItemRow, BookRow } from "@/types/database.types"

export type ReadingStatus = "to_read" | "reading" | "read" | "abandoned"

/**
 * LibraryItem con il book joinato — quello che usiamo nella UI.
 * Entrambi in snake_case, tipi dal DB.
 */
export interface LibraryItem extends LibraryItemRow {
  book: BookRow
}

export interface AddLibraryItemInput {
  book: import("@/api/books").BookMeta
  status: ReadingStatus
  shelf_ids: string[]
}