import { supabase } from "@/lib/supabase"
import type {
  Shelf,
  ShelfBook,
  ShelfDetail,
  ShelfInput,
  ShelfItemDisplay,
  ShelfTheme,
} from "./types"

/** Libri mostrati nell'anteprima a mensola dell'elenco scaffali. */
const PREVIEW_SIZE = 12

const SHELF_BOOK_SELECT =
  "id, position, display, library_item:library_items(id, spine_path, spine_ratio, book:books(id, title, authors, page_count, cover_url))" as const

type ShelfItemRow = {
  id: string
  position: number
  display: string
  library_item: ShelfBook["library_item"] | null
}

type ShelfListRow = {
  id: string
  name: string
  color_theme: string
  book_count: { count: number }[]
  preview: ShelfItemRow[]
}

// Gli elementi decorativi (Fase 4) non hanno library_item: qui servono solo i libri.
function toShelfBooks(rows: ShelfItemRow[]): ShelfBook[] {
  return rows.flatMap((row) =>
    row.library_item
      ? [
          {
            shelf_item_id: row.id,
            position: row.position,
            display: row.display as ShelfItemDisplay,
            library_item: row.library_item,
          },
        ]
      : [],
  )
}

function toShelf(row: ShelfListRow): Shelf {
  return {
    id: row.id,
    name: row.name,
    color_theme: row.color_theme as ShelfTheme,
    book_count: row.book_count[0]?.count ?? 0,
    preview: toShelfBooks(row.preview),
  }
}

export async function listShelves(): Promise<Shelf[]> {
  const { data, error } = await supabase
    .from("shelves")
    .select(`id, name, color_theme, book_count:shelf_items(count), preview:shelf_items(${SHELF_BOOK_SELECT})` as const)
    .order("created_at", { ascending: true })
    .order("position", { referencedTable: "preview", ascending: true })
    .limit(PREVIEW_SIZE, { referencedTable: "preview" })
  if (error) throw error
  return (data ?? []).map(toShelf)
}

/** null se lo scaffale non esiste o non è dell'utente (la RLS lo nasconde). */
export async function getShelf(shelfId: string): Promise<ShelfDetail | null> {
  const { data, error } = await supabase
    .from("shelves")
    .select(`id, name, color_theme, items:shelf_items(${SHELF_BOOK_SELECT})` as const)
    .eq("id", shelfId)
    .order("position", { referencedTable: "items", ascending: true })
    .maybeSingle()
  // 22P02: l'id nella URL non è un uuid valido → trattato come "non trovato"
  if (error?.code === "22P02") return null
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    color_theme: data.color_theme as ShelfTheme,
    books: toShelfBooks(data.items),
  }
}

export async function createShelf(
  userId: string,
  input: ShelfInput,
): Promise<Shelf> {
  const { data, error } = await supabase
    .from("shelves")
    .insert({ user_id: userId, name: input.name, color_theme: input.color_theme })
    .select("id, name, color_theme")
    .single()
  if (error) throw error
  return {
    id: data.id,
    name: data.name,
    color_theme: data.color_theme as ShelfTheme,
    book_count: 0,
    preview: [],
  }
}

export async function updateShelf(
  shelfId: string,
  input: Partial<ShelfInput>,
): Promise<void> {
  const { error } = await supabase.from("shelves").update(input).eq("id", shelfId)
  if (error) throw error
}

/** Elimina lo scaffale: i shelf_items vanno in cascata, i libri restano in libreria. */
export async function deleteShelf(shelfId: string): Promise<void> {
  const { error } = await supabase.from("shelves").delete().eq("id", shelfId)
  if (error) throw error
}

/** Accoda i libri allo scaffale: la posizione la assegna il trigger DB. */
export async function addBooksToShelf(
  shelfId: string,
  libraryItemIds: string[],
): Promise<void> {
  const { error } = await supabase
    .from("shelf_items")
    .insert(libraryItemIds.map((library_item_id) => ({ shelf_id: shelfId, library_item_id })))
  if (error) throw error
}

/** Accoda un solo libro e ne ritorna lo shelf_item: serve all'"Annulla" della rimozione. */
export async function addBookToShelf(
  shelfId: string,
  libraryItemId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("shelf_items")
    .insert({ shelf_id: shelfId, library_item_id: libraryItemId })
    .select("id")
    .single()
  if (error) throw error
  return data.id
}

/** Toglie un elemento dallo scaffale (il libro resta in libreria). */
export async function removeShelfItem(shelfItemId: string): Promise<void> {
  const { error } = await supabase.from("shelf_items").delete().eq("id", shelfItemId)
  if (error) throw error
}

/**
 * Nuovo ordine dello scaffale: `shelfItemIds` deve contenere esattamente gli
 * elementi dello scaffale. La RPC lo verifica e riscrive tutte le position.
 */
export async function reorderShelf(shelfId: string, shelfItemIds: string[]): Promise<void> {
  const { error } = await supabase.rpc("reorder_shelf", {
    p_shelf_id: shelfId,
    p_item_ids: shelfItemIds,
  })
  if (error) throw error
}

/** In piedi, sdraiato o di fronte: il client può modificare solo questa colonna di shelf_items. */
export async function setShelfItemDisplay(
  shelfItemId: string,
  display: ShelfItemDisplay,
): Promise<void> {
  const { error } = await supabase
    .from("shelf_items")
    .update({ display })
    .eq("id", shelfItemId)
    // .single(): se la RLS nasconde la riga è un errore, non 0 righe silenziose
    .select("id")
    .single()
  if (error) throw error
}

/** Violazione di unique (user_id, name): l'utente ha già uno scaffale con quel nome. */
export function isShelfNameTaken(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "23505"
}
