import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { updateProfileTheme, type ThemePreference } from "@/api/profile";
import { getStats } from "@/api/stats";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export type BooksView = "year" | "month";
export type ActivityView = "day" | "week";

export interface ChartPoint {
  label: string;
  value: number;
  isActive: boolean;
}

function getDayLabel(dateStr: string, dayLabels: readonly string[]): string {
  const day = new Date(dateStr).getDay();
  return dayLabels[day === 0 ? 6 : day - 1];
}

export function useProfileData() {
  const { t } = useTranslation();
  const { user, avatarUrl, signOut } = useAuth();
  const { theme, setTheme: setLocalTheme } = useTheme();
  const userId = user?.id ?? "";

  const [booksView, setBooksView] = useState<BooksView>("month");
  const [activityView, setActivityView] = useState<ActivityView>("day");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", userId],
    queryFn: () => getStats(),
    enabled: Boolean(userId),
  });

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setLocalTheme(next);
      void updateProfileTheme(next);
    },
    [setLocalTheme],
  );

  const dayLabels = t("profile.dayLabels", { returnObjects: true }) as string[];
  const monthLabels = t("profile.monthLabels", {
    returnObjects: true,
  }) as string[];

  const today = new Date().toISOString().slice(0, 10);

  const activityChartData: ChartPoint[] =
    activityView === "day"
      ? (stats?.activity_last7.map((d) => ({
          label: getDayLabel(d.date, dayLabels),
          value: d.pages,
          isActive: d.date === today,
        })) ?? [])
      : (stats?.activity_last6weeks.map((w, i, arr) => ({
          label: w.label,
          value: w.pages,
          isActive: i === arr.length - 1,
        })) ?? []);

  const activityTotal = activityChartData.reduce((s, d) => s + d.value, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const booksChartData: ChartPoint[] =
    booksView === "year"
      ? (stats?.books_by_year.map((y) => ({
          label: String(y.year),
          value: y.count,
          isActive: y.year === currentYear,
        })) ?? [])
      : (stats?.books_by_month.map((m) => ({
          label: monthLabels[m.month],
          value: m.count,
          isActive: m.month === currentMonth,
        })) ?? []);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";
  const displayName = user?.email ? user.email.split("@")[0] : "";

  return {
    data: {
      email: user?.email ?? "",
      displayName,
      initials,
      avatarUrl,
      stats,
      isLoading,
      activityChartData,
      activityTotal,
      booksChartData,
    },
    ui: { theme, booksView, activityView },
    actions: { setTheme, setBooksView, setActivityView, signOut },
  };
}
