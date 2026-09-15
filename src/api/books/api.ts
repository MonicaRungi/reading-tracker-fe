import { supabase } from "@/lib/supabase";
import type { Book, BookMeta } from "./types";

/** Cerca libri per titolo, autore o ISBN tramite Edge Function. */
export async function searchBooks(query: string): Promise<BookMeta[]> {
  const { data, error } = await supabase.functions.invoke<BookMeta[]>(
    "book-search",
    {
      body: { q: query },
    },
  );
  if (error) throw error;
  return data ?? [];
}

/** Lookup preciso per ISBN (usato dallo scanner). */
export async function lookupBookByIsbn(isbn: string): Promise<BookMeta | null> {
  const { data, error } = await supabase.functions.invoke<BookMeta>(
    "book-lookup",
    {
      body: { isbn },
    },
  );
  if (error) throw error;
  return data ?? null;
}

/**
 * Persiste un BookMeta nel catalogo condiviso.
 * Riusa la riga esistente se isbn13 già presente, altrimenti inserisce.
 */
export async function upsertBook(meta: BookMeta): Promise<Book> {
  if (meta.isbn13) {
    const { data: existing, error } = await supabase
      .from("books")
      .select("*")
      .eq("isbn13", meta.isbn13)
      .maybeSingle();
    if (error) throw error;
    if (existing) return existing;
  }

  const { data, error } = await supabase
    .from("books")
    .insert({
      isbn13: meta.isbn13,
      title: meta.title ?? "",
      authors: meta.authors,
      cover_url: meta.cover_url,
      page_count: meta.page_count,
      published_year: meta.published_year,
      publisher: meta.publisher,
      description: meta.description,
      genres: meta.genres,
      source: meta.source,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateBookPageCount(
  bookId: string,
  pageCount: number,
): Promise<Book> {
  const { data, error } = await supabase
    .from("books")
    .update({ page_count: pageCount })
    .eq("id", bookId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function enrichBookCover(
  bookId: string,
  isbn13: string,
): Promise<void> {
  const { data } = await supabase.functions.invoke("book-lookup", {
    body: { isbn: isbn13 },
  });
  if (!data?.cover_url) return;

  await supabase
    .from("books")
    .update({ cover_url: data.cover_url })
    .eq("id", bookId);
}
