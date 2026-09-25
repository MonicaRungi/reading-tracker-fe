import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BadgeWithStatus } from "@/api/badges";
import { BadgeGrid } from "@/components/shared/BadgeGrid";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";

export function FeaturedBadgesSheet({
  open,
  badges,
  selectedIds,
  maxFeatured,
  isSaving,
  onToggle,
  onSave,
  onClose,
}: {
  open: boolean;
  badges: BadgeWithStatus[];
  selectedIds: string[];
  maxFeatured: number;
  isSaving: boolean;
  onToggle: (badge: BadgeWithStatus) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isFull = selectedIds.length >= maxFeatured;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0"
        handleClassName="mb-3"
      >
        <div className="flex shrink-0 items-center justify-between px-3 pb-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            className="text-[15px] text-primary"
          >
            {t("common.cancel")}
          </Button>
          <SheetTitle className="text-[16px] font-bold text-foreground">
            {t("badges.pickerTitle")}
          </SheetTitle>
          <Button
            variant="ghost"
            onClick={onSave}
            disabled={isSaving}
            className="text-[15px] font-semibold text-primary"
          >
            {isSaving ? t("common.loading") : t("common.save")}
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3">
            <Star className="size-5 shrink-0 fill-primary text-primary" aria-hidden="true" />
            <p className="flex-1 text-[13px] leading-snug text-foreground">
              {t("badges.pickerHint", { count: maxFeatured })}
            </p>
            <div className="shrink-0 text-center" aria-live="polite">
              <p className="text-[18px] font-bold text-primary">
                {t("badges.pickerCounter", {
                  selected: selectedIds.length,
                  max: maxFeatured,
                })}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("badges.pickerCounterLabel")}
              </p>
            </div>
          </div>

          <BadgeGrid
            badges={badges}
            onSelect={onToggle}
            getSelection={(badge) => {
              const selected = selectedIds.includes(badge.id);
              return {
                selected,
                disabled: !badge.unlocked || (!selected && isFull),
              };
            }}
          />
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
