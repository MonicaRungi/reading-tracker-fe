import type { Shelf } from "./types"

let mockShelves: Shelf[] = [
  { id: "sh-1", name: "Estate 2026", bookCount: 3 },
  { id: "sh-2", name: "Saggistica", bookCount: 5 },
]

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 300))
}

export async function listShelves(_userId: string): Promise<Shelf[]> {
  return delay(mockShelves)
}

export async function createShelf(_userId: string, name: string): Promise<Shelf> {
  const shelf: Shelf = { id: crypto.randomUUID(), name, bookCount: 0 }
  mockShelves = [...mockShelves, shelf]
  return delay(shelf)
}

export async function addBookToShelf(
  _userId: string,
  shelfId: string,
  _bookId: string,
): Promise<void> {
  mockShelves = mockShelves.map((shelf) =>
    shelf.id === shelfId ? { ...shelf, bookCount: shelf.bookCount + 1 } : shelf,
  )
  await delay(undefined)
}

export async function removeBookFromShelf(
  _userId: string,
  shelfId: string,
  _bookId: string,
): Promise<void> {
  mockShelves = mockShelves.map((shelf) =>
    shelf.id === shelfId ? { ...shelf, bookCount: Math.max(0, shelf.bookCount - 1) } : shelf,
  )
  await delay(undefined)
}
