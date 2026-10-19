import { FunctionsHttpError } from "@supabase/supabase-js";
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

/**
 * Cerca libri per titolo, autore o ISBN tramite Edge Function. `signal`
 * annulla la richiesta quando la query è superata da una più recente.
 */
export async function searchBooks(
  query: string,
  signal?: AbortSignal,
): Promise<BookMeta[]> {
  const { data, error } = await supabase.functions.invoke<BookMeta[]>(
    "book-search",
    {
      body: { q: query },
      signal,
    },
  );
  if (error) throw error;
  return data ?? [];
}

/** Lookup preciso per ISBN (usato dallo scanner). null = ISBN sconosciuto (404). */
export async function lookupBookByIsbn(isbn: string): Promise<BookMeta | null> {
  const { data, error } = await supabase.functions.invoke<BookMeta>(
    "book-lookup",
    {
      body: { isbn },
    },
  );
  if (error instanceof FunctionsHttpError && error.context.status === 404) return null;
  if (error) throw error;
  return data ?? null;
}

/**
 * Persiste un BookMeta nel catalogo condiviso tramite la Edge Function
 * book-save (unico punto di scrittura di `books`): riusa la riga esistente se
 * l'ISBN è già presente, altrimenti completa i metadati, sceglie la copertina
 * migliore e inserisce.
 */
export async function upsertBook(meta: BookMeta): Promise<Book> {
  const { data, error } = await supabase.functions.invoke<Book>("book-save", {
    body: { book: meta },
  });
  if (error) throw error;
  if (!data) throw new Error("book-save: risposta vuota");
  return data;
}

/** Numero di pagine corretto dall'utente (solo libri nella sua libreria). */
export async function updateBookPageCount(
  bookId: string,
  pageCount: number,
): Promise<Book> {
  const { data, error } = await supabase.rpc("set_book_page_count", {
    p_book_id: bookId,
    p_page_count: pageCount,
  });
  if (error) throw error;
  return data;
}

/**
 * Rifà il fetch dei metadati e, se ne trova una migliore, della copertina.
 * Riempie solo i campi vuoti. Solo per libri nella libreria dell'utente.
 */
export async function refreshBook(bookId: string): Promise<Book> {
  const { data, error } = await supabase.functions.invoke<Book>("book-save", {
    body: { bookId, refresh: true },
  });
  if (error) throw error;
  if (!data) throw new Error("book-save: risposta vuota");
  return data;
}
