import { toISODate } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Stats } from "./types";

export async function getStats(): Promise<Stats> {
  const [readItems, logRows, activityRows] = await Promise.all([
    supabase
      .from("library_items")
      .select("finished_at, book:books(genres)")
      .eq("status", "read"),
    supabase.from("reading_log").select("pages_read"),
    supabase
      .from("reading_log")
      .select("log_date, pages_read")
      .order("log_date", { ascending: false })
      .limit(30),
  ]);

  if (readItems.error) throw readItems.error;
  if (logRows.error) throw logRows.error;
  if (activityRows.error) throw activityRows.error;

  const totalBooksRead = readItems.data.length;
  const totalPagesRead = logRows.data.reduce((sum, r) => sum + r.pages_read, 0);

  // Dentro getStats, dopo totalPagesRead:
  const totalInReading =
    (
      await supabase
        .from("library_items")
        .select("id", { count: "exact", head: true })
        .eq("status", "reading")
    ).count ?? 0;

  const ratingsData = await supabase
    .from("library_items")
    .select("rating")
    .not("rating", "is", null);

  const ratings = ratingsData.data?.map((r) => r.rating as number) ?? [];
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
      : null;

  const byYear = new Map<number, number>();
  for (const item of readItems.data) {
    if (!item.finished_at) continue;
    const year = new Date(item.finished_at).getFullYear();
    byYear.set(year, (byYear.get(year) ?? 0) + 1);
  }
  const books_by_year = [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year, count }));

  const currentYear = new Date().getFullYear();
  const byMonth = new Map<number, number>();
  for (const item of readItems.data) {
    if (!item.finished_at) continue;
    const d = new Date(item.finished_at);
    if (d.getFullYear() !== currentYear) continue;
    const month = d.getMonth(); // 0-11
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  const books_by_month = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    count: byMonth.get(i) ?? 0,
  }));

  const genreCounts = new Map<string, number>();
  let total = 0;
  for (const item of readItems.data) {
    const book = item.book as { genres: string[] | null } | null;
    for (const g of book?.genres ?? []) {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      total++;
    }
  }
  const genres = [...genreCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([genre, count]) => ({
      genre,
      percent: total > 0 ? count / total : 0,
    }));

  // Ultimi 7 giorni — sempre 7 elementi, 0 se non hai letto
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toISODate(d);
  });
  const logMap = new Map(
    activityRows.data.map((r) => [
      r.log_date as string,
      r.pages_read as number,
    ]),
  );
  const activity_last7 = last7.map((date) => ({
    date,
    pages: logMap.get(date) ?? 0,
  }));

  const last6Weeks = Array.from({ length: 6 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(
      weekStart.getDate() - weekStart.getDay() + 1 - (5 - i) * 7,
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return {
      start: toISODate(weekStart),
      end: toISODate(weekEnd),
      label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
    };
  });

  const activity_last6weeks = last6Weeks.map(({ start, end, label }) => ({
    label,
    pages: activityRows.data
      .filter((r) => r.log_date >= start && r.log_date <= end)
      .reduce((s, r) => s + r.pages_read, 0),
  }));

  return {
    total_books_read: totalBooksRead,
    total_pages_read: totalPagesRead,
    total_in_reading: totalInReading,
    avg_rating: avgRating,
    books_by_year,
    books_by_month,
    genres,
    activity_last7,
    activity_last6weeks,
  };
}
