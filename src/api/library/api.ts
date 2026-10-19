import { supabase } from "@/lib/supabase";
import { upsertBook } from "@/api/books";
import { toISODate } from "@/lib/format";
import type {
  AddLibraryItemInput,
  LibraryItem,
  LibraryPage,
  LibraryPageParams,
  ReadingStatus,
} from "./types";

const LIBRARY_SELECT = "*, book:books(*)";

function today(): string {
  return toISODate();
}

export async function listLibrary(): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from("library_items")
    .select(LIBRARY_SELECT)
    .order("finished_at", { ascending: false, nullsFirst: false })
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LibraryItem[];
}

export async function listLibraryPage({
  status,
  query,
  offset,
  limit,
}: LibraryPageParams): Promise<LibraryPage> {
  const { data, error, count } = await supabase
    .rpc(
      "search_library",
      { p_status: status, p_query: query?.trim() || undefined },
      { count: "exact" },
    )
    .select(LIBRARY_SELECT)
    .order("finished_at", { ascending: false, nullsFirst: false })
    .order("added_at", { ascending: false })
    // tie-breaker: senza un ordinamento univoco le pagine possono
    // ripetere o saltare righe con le stesse date
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { items: (data ?? []) as LibraryItem[], total: count ?? 0 };
}

export async function addLibraryItem(
  userId: string,
  input: AddLibraryItemInput,
): Promise<LibraryItem> {
  const book = await upsertBook(input.book);

  const { data, error } = await supabase
    .from("library_items")
    .insert({
      user_id: userId,
      book_id: book.id,
      status: input.status,
      started_at: input.status === "reading" ? today() : null,
      finished_at: input.status === "read" ? today() : null,
    })
    .select(LIBRARY_SELECT)
    .single();
  if (error) throw error;

  if (input.shelf_ids.length > 0) {
    const { error: shelfError } = await supabase.from("shelf_items").insert(
      input.shelf_ids.map((shelf_id) => ({
        shelf_id,
        library_item_id: data.id,
      })),
    );
    if (shelfError) throw shelfError;
  }

  return data as LibraryItem;
}

export async function updateStatus(
  itemId: string,
  status: ReadingStatus,
): Promise<LibraryItem> {
  const { data: current, error: fetchError } = await supabase
    .from("library_items")
    .select(
      "user_id, started_at, finished_at, current_page, book:books(page_count)",
    )
    .eq("id", itemId)
    .single();
  if (fetchError) throw fetchError;

  // Se si torna a to_read o reading, azzera il voto (altrimenti viola il check constraint)
  const resetRating = status === "to_read" || status === "reading";

  // Segnando il libro come letto, le pagine non ancora registrate contano come
  // lette oggi: porta current_page al totale e aggiorna il reading_log.
  const pageCount = current.book?.page_count ?? 0;
  const missingPages =
    status === "read"
      ? Math.max(0, pageCount - (current.current_page ?? 0))
      : 0;

  const { data, error } = await supabase
    .from("library_items")
    .update({
      status,
      rating: resetRating ? null : undefined,
      started_at:
        status === "reading"
          ? (current.started_at ?? today())
          : current.started_at,
      finished_at: status === "read" ? today() : current.finished_at,
      current_page: missingPages > 0 ? pageCount : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select(LIBRARY_SELECT)
    .single();
  if (error) throw error;

  if (missingPages > 0) await logPagesRead(missingPages);

  return data as LibraryItem;
}

export async function updateProgress(
  itemId: string,
  newPage: number,
): Promise<LibraryItem> {
  const { data: current, error: fetchError } = await supabase
    .from("library_items")
    .select("current_page")
    .eq("id", itemId)
    .single();
  if (fetchError) throw fetchError;

  const delta = newPage - (current.current_page ?? 0);

  const { data, error } = await supabase
    .from("library_items")
    .update({ current_page: newPage, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select(LIBRARY_SELECT)
    .single();
  if (error) throw error;

  if (delta > 0) await logPagesRead(delta);

  return data as LibraryItem;
}

export async function updateDate(
  itemId: string,
  field: "started" | "finished",
  date: string,
): Promise<LibraryItem> {
  const updatePayload =
    field === "started"
      ? { started_at: date, updated_at: new Date().toISOString() }
      : { finished_at: date, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("library_items")
    .update(updatePayload)
    .eq("id", itemId)
    .select(LIBRARY_SELECT)
    .single();
  if (error) throw error;
  return data as LibraryItem;
}

/**
 * Somma il delta alla riga di oggi di reading_log e al totale del profilo
 * (badge pagine), in modo atomico nel DB. La data è quella locale dell'utente.
 */
async function logPagesRead(delta: number): Promise<void> {
  const { error } = await supabase.rpc("log_pages_read", {
    p_log_date: today(),
    p_delta: delta,
  });
  if (error) throw error;
}

export async function rateItem(
  itemId: string,
  rating: number,
): Promise<LibraryItem> {
  const { data, error } = await supabase
    .from("library_items")
    .update({ rating, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select(LIBRARY_SELECT)
    .single();
  if (error) throw error;
  return data as LibraryItem;
}

export async function deleteLibraryItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("library_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
}
