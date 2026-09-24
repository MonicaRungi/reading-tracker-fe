import type { Stats } from "@/api/stats";
import { BookMarked, BookOpen, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "./StatCard";

export function StatsGrid({ stats }: { stats: Stats }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={<BookOpen className="size-5 text-primary" />}
        value={String(stats.total_books_read)}
        label={t("profile.booksRead")}
      />
      <StatCard
        icon={<Star className="size-5 text-primary" />}
        value={stats.avg_rating ?? "—"}
        label={t("profile.avgRating")}
      />
      <StatCard
        icon={<BookMarked className="size-5 text-primary" />}
        value={String(stats.total_in_reading ?? "—")}
        label={t("profile.inReading")}
      />
    </div>
  );
}
