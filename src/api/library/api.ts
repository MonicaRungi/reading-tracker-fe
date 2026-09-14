import { supabase } from "@/lib/supabase";
import { upsertBook } from "@/api/books";
import type { AddLibraryItemInput, LibraryItem, ReadingStatus } from "./types";

const LIBRARY_SELECT = "*, book:books(*)";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listLibrary(): Promise<LibraryItem[]> {
  const { data, error } = await supabase
    .from("library_items")
    .select(LIBRARY_SELECT)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LibraryItem[];
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
    .select("started_at, finished_at")
    .eq("id", itemId)
    .single();
  if (fetchError) throw fetchError;

  // Se si torna a to_read o reading, azzera il voto (altrimenti viola il check constraint)
  const resetRating = status === "to_read" || status === "reading";

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
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select(LIBRARY_SELECT)
    .single();
  if (error) throw error;
  return data as LibraryItem;
}

export async function updateProgress(
  userId: string,
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

  if (delta > 0) await logPagesRead(userId, delta);

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

async function logPagesRead(userId: string, delta: number): Promise<void> {
  const log_date = today();
  const { data: existing, error: fetchError } = await supabase
    .from("reading_log")
    .select("pages_read")
    .eq("user_id", userId)
    .eq("log_date", log_date)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("reading_log").upsert(
    {
      user_id: userId,
      log_date,
      pages_read: (existing?.pages_read ?? 0) + delta,
    },
    { onConflict: "user_id,log_date" },
  );
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
