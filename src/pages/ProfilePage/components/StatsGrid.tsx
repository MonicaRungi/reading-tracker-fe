import { BookMarked, BookOpen, FileText, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Stats } from "@/api/stats";
import { StatCard } from "./StatCard";

export function StatsGrid({ stats }: { stats: Stats }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<BookOpen className="size-5 text-primary" />}
        value={String(stats.total_books_read)}
        label={t("profile.booksRead")}
      />
      <StatCard
        icon={<FileText className="size-5 text-primary" />}
        value={stats.total_pages_read.toLocaleString("it")}
        label={t("profile.pagesRead")}
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
