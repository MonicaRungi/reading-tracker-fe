import { supabase } from "@/lib/supabase"
import type { BookMeta } from "./types"

export async function searchBooks(query: string): Promise<BookMeta[]> {
  const { data, error } = await supabase.functions.invoke<BookMeta[]>("book-search", {
    body: { q: query },
  })
  if (error) throw error
  return data ?? []
}

export async function lookupBookByIsbn(isbn: string): Promise<BookMeta | null> {
  const { data, error } = await supabase.functions.invoke<BookMeta | null>("book-lookup", {
    body: { isbn },
  })
  if (error) throw error
  return data ?? null
}
