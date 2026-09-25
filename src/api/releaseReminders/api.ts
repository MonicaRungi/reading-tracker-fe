import { supabase } from "@/lib/supabase";
import type { ReleaseReminder } from "./types";

const UNIQUE_VIOLATION = "23505";

/**
 * Il job giornaliero lo trasforma in notifica 'book_release' alla data.
 * Insert semplice, non upsert: `ON CONFLICT DO UPDATE` richiederebbe il
 * permesso di UPDATE, che per questa tabella non è concesso. Se il promemoria
 * esiste già (unique user_id + book_id) si restituisce quello.
 */
export async function createReminder(
  userId: string,
  bookId: string,
  releaseDate: string,
): Promise<ReleaseReminder> {
  const { data, error } = await supabase
    .from("release_reminders")
    .insert({ user_id: userId, book_id: bookId, release_date: releaseDate })
    .select("*")
    .single();
  if (!error) return data;
  if (error.code === UNIQUE_VIOLATION) {
    const existing = await getReminderForBook(bookId);
    if (existing) return existing;
  }
  throw error;
}

export async function deleteReminder(bookId: string): Promise<void> {
  const { error } = await supabase
    .from("release_reminders")
    .delete()
    .eq("book_id", bookId);
  if (error) throw error;
}

export async function getReminderForBook(
  bookId: string,
): Promise<ReleaseReminder | null> {
  const { data, error } = await supabase
    .from("release_reminders")
    .select("*")
    .eq("book_id", bookId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
