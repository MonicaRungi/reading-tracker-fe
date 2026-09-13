import type { AddLibraryItemInput, LibraryItem, ReadingStatus } from "./types"

// Mock in-memory store. Le firme restano invariate quando Supabase sostituisce
// questi corpi — vedi CLAUDE.md "Data layer convention".
let mockLibrary: LibraryItem[] = [
  {
    id: "li-1",
    book: {
      id: "b-1",
      isbn: "9788806219215",
      title: "Norwegian Wood",
      author: "Haruki Murakami",
      coverUrl: null,
      pageCount: 296,
    },
    status: "reading",
    progressPercent: 42,
    rating: null,
    startedAt: "2026-08-20",
    finishedAt: null,
    shelfIds: [],
  },
  {
    id: "li-2",
    book: {
      id: "b-2",
      isbn: null,
      title: "Le città invisibili",
      author: "Italo Calvino",
      coverUrl: null,
      pageCount: 164,
    },
    status: "to_read",
    progressPercent: null,
    rating: null,
    startedAt: null,
    finishedAt: null,
    shelfIds: [],
  },
]

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 300))
}

export async function listLibrary(_userId: string): Promise<LibraryItem[]> {
  return delay(mockLibrary)
}

export async function addLibraryItem(
  _userId: string,
  input: AddLibraryItemInput,
): Promise<LibraryItem> {
  const item: LibraryItem = {
    id: crypto.randomUUID(),
    book: input.book,
    status: input.status,
    progressPercent: input.status === "reading" ? 0 : null,
    rating: null,
    startedAt: input.status === "reading" ? new Date().toISOString() : null,
    finishedAt: null,
    shelfIds: input.shelfIds,
  }
  mockLibrary = [item, ...mockLibrary]
  return delay(item)
}

export async function updateLibraryItemStatus(
  _userId: string,
  itemId: string,
  status: ReadingStatus,
): Promise<LibraryItem> {
  const today = new Date().toISOString()
  mockLibrary = mockLibrary.map((item) =>
    item.id === itemId
      ? {
          ...item,
          status,
          startedAt: status === "reading" ? (item.startedAt ?? today) : item.startedAt,
          finishedAt: status === "read" ? today : item.finishedAt,
        }
      : item,
  )
  const updated = mockLibrary.find((item) => item.id === itemId)
  if (!updated) throw new Error(`Library item ${itemId} not found`)
  return delay(updated)
}

export async function updateLibraryItemProgress(
  _userId: string,
  itemId: string,
  progressPercent: number,
): Promise<LibraryItem> {
  mockLibrary = mockLibrary.map((item) =>
    item.id === itemId ? { ...item, progressPercent } : item,
  )
  const updated = mockLibrary.find((item) => item.id === itemId)
  if (!updated) throw new Error(`Library item ${itemId} not found`)
  return delay(updated)
}

export async function rateLibraryItem(
  _userId: string,
  itemId: string,
  rating: number,
): Promise<LibraryItem> {
  mockLibrary = mockLibrary.map((item) => (item.id === itemId ? { ...item, rating } : item))
  const updated = mockLibrary.find((item) => item.id === itemId)
  if (!updated) throw new Error(`Library item ${itemId} not found`)
  return delay(updated)
}
