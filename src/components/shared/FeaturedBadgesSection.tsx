import { useTranslation } from "react-i18next";
import type { BadgeWithStatus } from "@/api/badges";
import { BadgeGrid } from "@/components/shared/BadgeGrid";
import { Button } from "@/components/ui/button";

/** Vetrina "Badge in evidenza", con un'azione a destra del titolo (Vedi tutti / Modifica). */
export function FeaturedBadgesSection({
  badges,
  maxFeatured,
  actionLabel,
  onAction,
  onSelect,
}: {
  badges: BadgeWithStatus[];
  maxFeatured: number;
  actionLabel: string;
  onAction: () => void;
  onSelect: (badge: BadgeWithStatus) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-foreground">
          {t("badges.featuredTitle")}
        </h2>
        <Button
          variant="link"
          onClick={onAction}
          className="h-auto p-0 text-[14px] font-medium"
        >
          {actionLabel}
        </Button>
      </div>

      {badges.length > 0 ? (
        <BadgeGrid badges={badges} onSelect={onSelect} showFeaturedMark={false} />
      ) : (
        <p className="rounded-2xl bg-card px-4 py-5 text-center text-[13px] text-muted-foreground">
          {t("badges.featuredEmpty", { count: maxFeatured })}
        </p>
      )}
    </section>
  );
}
