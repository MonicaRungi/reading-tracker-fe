import type { Book } from "@/api/books";

/** Dopo quanti mesi dall'ultimo fetch i metadati di un libro si rifanno. */
export const BOOK_REFRESH_AFTER_MONTHS = 6;

/**
 * Il libro va aggiornato dalle fonti? Si decide solo dal dettaglio (mai in
 * ricerca, libreria o liste):
 * - metadati più vecchi di BOOK_REFRESH_AFTER_MONTHS;
 * - libri importati da Goodreads senza copertina (l'import non ne porta):
 *   si riprova a ogni apertura finché una fonte non la fornisce.
 */
export function needsRefresh(
  book: Pick<Book, "fetched_at" | "cover_url" | "isbn13" | "source">,
  now = new Date(),
): boolean {
  if (book.source === "goodreads" && !book.cover_url && book.isbn13) return true;
  const threshold = new Date(now);
  threshold.setMonth(threshold.getMonth() - BOOK_REFRESH_AFTER_MONTHS);
  return new Date(book.fetched_at) < threshold;
}
