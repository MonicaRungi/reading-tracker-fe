import type { BookMeta } from "@/api/books"

export type ReadingStatus = "to_read" | "reading" | "read" | "abandoned"

export interface LibraryItem {
  id: string
  book: BookMeta
  status: ReadingStatus
  progressPercent: number | null
  rating: number | null
  startedAt: string | null
  finishedAt: string | null
  shelfIds: string[]
}

export interface AddLibraryItemInput {
  book: BookMeta
  status: ReadingStatus
  shelfIds: string[]
}
