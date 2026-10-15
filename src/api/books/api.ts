import { supabase } from "@/lib/supabase";
import type { Book, BookMeta } from "./types";

/** Host di copertine senza CORS: per disegnarle su un canvas passano da cover-proxy. */
const PROXIED_COVER_HOSTS = new Set(["books.google.com", "books.googleusercontent.com"]);

/**
 * Copertina come Blob leggibile da un canvas (esportazione della mensola), o
 * null se non si carica. Google Books passa dalla Edge Function cover-proxy;
 * le altre fonti (Open Library) mandano già il CORS. Niente invoke(): con
 * un'immagine come risposta la leggerebbe come testo.
 */
export async function fetchCoverBlob(coverUrl: string): Promise<Blob | null> {
  let host: string;
  try {
    host = new URL(coverUrl).hostname;
  } catch {
    return null;
  }
  try {
    if (!PROXIED_COVER_HOSTS.has(host)) {
      const direct = await fetch(coverUrl, { mode: "cors" });
      return direct.ok ? await direct.blob() : null;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cover-proxy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: coverUrl }),
    });
    return res.ok ? await res.blob() : null;
  } catch {
    return null;
  }
}

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
    if (existing) {
      // Libro già a catalogo senza data completa: la aggiunge se ora la fonte
      // la fornisce (serve al promemoria di uscita).
      if (!existing.published_date && meta.published_date) {
        const { data: updated } = await supabase
          .from("books")
          .update({ published_date: meta.published_date })
          .eq("id", existing.id)
          .select("*")
          .maybeSingle();
        return updated ?? existing;
      }
      return existing;
    }
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
      published_date: meta.published_date ?? null,
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
