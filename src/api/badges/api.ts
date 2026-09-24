import { supabase } from "@/lib/supabase";
import type { Badge, UserBadge, UserProgress } from "./types";

const BADGE_SELECT =
  "id, key, category, tier, title, description, metric, threshold, icon_key";

export async function listBadgeCatalog(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from("badges")
    .select(BADGE_SELECT)
    .order("threshold", { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as Badge[];
}

export async function listUserBadges(): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .order("unlocked_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function toggleFeatured(
  badgeId: string,
  featured: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("user_badges")
    .update({ is_featured: featured })
    .eq("badge_id", badgeId);
  if (error) throw error;
}

export async function getUserProgress(): Promise<UserProgress> {
  const [booksCount, profile, readBooks, goalsCount] = await Promise.all([
    supabase
      .from("library_items")
      .select("id", { count: "exact", head: true })
      .eq("status", "read"),
    supabase.from("profiles").select("total_pages_read").maybeSingle(),
    supabase
      .from("library_items")
      .select("book:books(page_count)")
      .eq("status", "read"),
    supabase
      .from("reading_goals")
      .select("id", { count: "exact", head: true })
      .eq("status", "achieved"),
  ]);
  if (booksCount.error) throw booksCount.error;
  if (profile.error) throw profile.error;
  if (readBooks.error) throw readBooks.error;
  if (goalsCount.error) throw goalsCount.error;

  const longest = readBooks.data.reduce(
    (max, row) => Math.max(max, row.book?.page_count ?? 0),
    0,
  );

  return {
    books_completed: booksCount.count ?? 0,
    pages_read: profile.data?.total_pages_read ?? 0,
    longest_book_pages: longest,
    goals_completed: goalsCount.count ?? 0,
  };
}
