import type { BookMeta } from "@/api/books";
import type { LibraryItem } from "@/api/library";

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function titleAuthorKey(title: string | null, authors: string[] | null): string | null {
  const t = normalize(title);
  if (!t) return null;
  return `${t}|${normalize(authors?.[0])}`;
}

/**
 * Costruisce un lookup dei libri già in libreria: prima per ISBN-13,
 * poi (fallback) per titolo + primo autore, per i risultati senza ISBN.
 */
export function createLibraryMatcher(items: LibraryItem[]) {
  const byIsbn = new Map<string, LibraryItem>();
  const byTitleAuthor = new Map<string, LibraryItem>();

  for (const item of items) {
    if (item.book.isbn13) byIsbn.set(item.book.isbn13, item);
    const key = titleAuthorKey(item.book.title, item.book.authors);
    if (key) byTitleAuthor.set(key, item);
  }

  return (book: BookMeta): LibraryItem | null => {
    if (book.isbn13 && byIsbn.has(book.isbn13)) return byIsbn.get(book.isbn13)!;
    const key = titleAuthorKey(book.title, book.authors);
    return (key && byTitleAuthor.get(key)) || null;
  };
}
