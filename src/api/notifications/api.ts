import { supabase } from "@/lib/supabase";
import type { NotificationRow } from "@/types/database.types";
import type { AppNotification } from "./types";

const TYPES = new Set<string>(["goal_renewal", "book_release", "badge_unlocked"]);

/** Riga DB → notifica tipizzata; scarta tipi sconosciuti o payload malformati. */
export function parseNotification(row: NotificationRow): AppNotification | null {
  const { payload } = row;
  if (!TYPES.has(row.type)) return null;
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return null;
  }
  return row as unknown as AppNotification;
}

export async function listNotifications(unreadOnly = false): Promise<AppNotification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (unreadOnly) query = query.is("read_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? [])
    .map(parseNotification)
    .filter((n): n is AppNotification => n !== null);
}

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .is("read_at", null);
  if (error) throw error;
}

export async function markAllAsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) throw error;
}

/** Segna come letti gli inviti al rinnovo di questi goal (dopo averli rinnovati). */
export async function markRenewalNotificationsRead(goalIds: string[]): Promise<void> {
  if (goalIds.length === 0) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("type", "goal_renewal")
    .in("payload->>goal_id", goalIds)
    .is("read_at", null);
  if (error) throw error;
}

/** Cancellazione hard (retention: 30 giorni, vedi job di pulizia). */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);
  if (error) throw error;
}
