import type { Stats } from "./types"

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 300))
}

export async function getStats(_userId: string): Promise<Stats> {
  return delay({
    totalBooksRead: 12,
    totalPagesRead: 3480,
    booksByYear: [
      { year: 2024, count: 4 },
      { year: 2025, count: 6 },
      { year: 2026, count: 2 },
    ],
    genres: [
      { genre: "Narrativa", percent: 0.5 },
      { genre: "Saggistica", percent: 0.3 },
      { genre: "Fantascienza", percent: 0.2 },
    ],
  })
}
