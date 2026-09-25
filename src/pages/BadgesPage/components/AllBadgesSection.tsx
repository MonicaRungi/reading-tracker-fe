import { useTranslation } from "react-i18next";
import type { BadgeWithStatus } from "@/api/badges";
import { BadgeGrid } from "@/components/shared/BadgeGrid";

export function AllBadgesSection({
  badges,
  unlocked,
  onSelect,
}: {
  badges: BadgeWithStatus[];
  unlocked: number;
  onSelect: (badge: BadgeWithStatus) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[17px] font-bold text-foreground">
          {t("badges.allTitle")}
        </h2>
        <span className="text-[12px] text-muted-foreground">
          {t("badges.unlockedCount", { unlocked, total: badges.length })}
        </span>
      </div>
      <BadgeGrid badges={badges} onSelect={onSelect} />
    </section>
  );
}
