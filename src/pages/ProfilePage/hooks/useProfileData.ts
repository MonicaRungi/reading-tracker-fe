import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  getProfile,
  updateProfileTheme,
  type ThemePreference,
} from "@/api/profile";
import { getStats } from "@/api/stats";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toISODate } from "@/lib/format";
import { getInitials, resolveDisplayName } from "@/lib/profileName";
import { useNavigate } from "react-router-dom";
import { useBadges } from "@/hooks/useBadges";

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

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(),
    enabled: Boolean(userId),
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", userId],
    queryFn: () => getStats(),
    enabled: Boolean(userId),
  });

  const navigate = useNavigate();
  const badges = useBadges(userId);

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

  const today = toISODate();

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
      ? (stats?.books_by_year
          .slice(-8)
          .map((y) => ({
            label: String(y.year),
            value: y.count,
            isActive: y.year === currentYear,
          })) ?? [])
      : (stats?.books_by_month.map((m) => ({
          label: monthLabels[m.month],
          value: m.count,
          isActive: m.month === currentMonth,
        })) ?? []);

  const displayName = resolveDisplayName({
    profileName: profile?.display_name,
    metadata: user?.user_metadata,
    email: user?.email,
  });
  const initials = getInitials(displayName);

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
      featuredBadges: badges.data.featuredBadges,
      maxFeatured: badges.data.maxFeatured,
      canFeatureMore: badges.data.canFeatureMore,
      selectedBadge: badges.data.selectedBadge,
      selectedBadgeProgress: badges.data.selectedBadgeProgress,
    },
    ui: {
      theme,
      booksView,
      activityView,
      isTogglingFeatured: badges.ui.isTogglingFeatured,
    },
    actions: {
      setTheme,
      setBooksView,
      setActivityView,
      signOut,
      openBadge: badges.actions.openBadge,
      closeBadge: badges.actions.closeBadge,
      toggleBadgeFeatured: badges.actions.toggleBadgeFeatured,
      goToBadges: () => navigate("/profile/badges"),
    },
  };
}
