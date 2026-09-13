import { supabase } from "@/lib/supabase"
import type { Shelf } from "./types"

export async function listShelves(): Promise<Shelf[]> {
  const { data, error } = await supabase
    .from("shelves")
    .select("id, name, shelf_items(count)")
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    book_count: (row.shelf_items as unknown as { count: number }[])[0]?.count ?? 0,
  }))
}

export async function createShelf(userId: string, name: string): Promise<Shelf> {
  const { data, error } = await supabase
    .from("shelves")
    .insert({ user_id: userId, name })
    .select("id, name, shelf_items(count)")
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    book_count: (data.shelf_items as unknown as { count: number }[])[0]?.count ?? 0,
  }
}

export async function addBookToShelf(shelfId: string, libraryItemId: string): Promise<void> {
  const { error } = await supabase
    .from("shelf_items")
    .insert({ shelf_id: shelfId, library_item_id: libraryItemId })
  if (error) throw error
}

export async function removeBookFromShelf(shelfId: string, libraryItemId: string): Promise<void> {
  const { error } = await supabase
    .from("shelf_items")
    .delete()
    .eq("shelf_id", shelfId)
    .eq("library_item_id", libraryItemId)
  if (error) throw error
}