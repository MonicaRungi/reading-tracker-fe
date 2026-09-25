import { BookOpen, CalendarDays, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BadgeProgressInfo, BadgeWithStatus } from "@/api/badges";
import { BadgeIcon } from "@/components/shared/BadgeIcon";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BadgeDetailSheet({
  badge,
  progress,
  canFeatureMore,
  maxFeatured,
  isTogglingFeatured,
  onToggleFeatured,
  onClose,
}: {
  badge: BadgeWithStatus | null;
  progress: BadgeProgressInfo | null;
  canFeatureMore: boolean;
  maxFeatured: number;
  isTogglingFeatured: boolean;
  onToggleFeatured: (badge: BadgeWithStatus) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (!badge) return null;

  const featureBlocked = !badge.is_featured && !canFeatureMore;
  const ratio = progress ? progress.current / progress.target : 0;

  return (
    <Sheet open={!!badge} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent
        className="max-h-[85vh] gap-0 overflow-y-auto px-5"
      >
        <div className="flex items-center gap-4 pb-5 pr-6">
          <BadgeIcon
            iconKey={badge.icon_key}
            locked={!badge.unlocked}
            className="size-28"
          />
          <div className="min-w-0 space-y-1.5">
            <SheetTitle className="text-[20px] font-bold leading-tight text-foreground">
              {badge.title}
            </SheetTitle>
            <SheetDescription className="text-[13px] leading-snug text-muted-foreground">
              {badge.description}
            </SheetDescription>
          </div>
        </div>

        <div className="space-y-3 pb-5">
          {!badge.unlocked && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-foreground">
                  {t("badges.progressLabel")}
                </span>
                <span className="text-[13px] font-semibold text-primary">
                  {t(`badges.progress.${progress.metric}`, {
                    current: formatNumber(progress.current),
                    target: formatNumber(progress.target),
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar percent={ratio * 100} />
                </div>
                <span className="text-[12px] text-muted-foreground">
                  {formatPercent(ratio)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 rounded-xl bg-accent p-4">
            <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 space-y-0.5">
              <p className="text-[14px] font-semibold text-foreground">
                {t("badges.requirement")}
              </p>
              <p className="text-[13px] text-muted-foreground">
                {badge.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="flex-1 text-[14px] font-semibold text-foreground">
              {t("badges.unlockDate")}
            </span>
            <span className="text-[13px] text-muted-foreground">
              {badge.unlocked_at
                ? formatDate(badge.unlocked_at)
                : t("badges.notUnlocked")}
            </span>
          </div>
        </div>

        {badge.unlocked && (
          <div className="space-y-2 pb-5">
            <Button
              onClick={() => onToggleFeatured(badge)}
              disabled={featureBlocked || isTogglingFeatured}
              variant={badge.is_featured ? "outline" : "default"}
              className="h-auto w-full gap-2 rounded-xl py-[14px] text-[15px] font-medium"
            >
              <Star
                className={cn("size-4", badge.is_featured && "fill-primary text-primary")}
                aria-hidden="true"
              />
              {badge.is_featured ? t("badges.unfeature") : t("badges.feature")}
            </Button>
            <p className="text-center text-[12px] text-muted-foreground">
              {featureBlocked
                ? t("badges.featuredLimitReached", { count: maxFeatured })
                : t("badges.featuredNote", { count: maxFeatured })}
            </p>
          </div>
        )}
      </BottomSheetContent>
    </Sheet>
  );
}
