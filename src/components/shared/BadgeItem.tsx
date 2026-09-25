import { Check, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BadgeWithStatus } from "@/api/badges";
import { BadgeIcon } from "@/components/shared/BadgeIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BadgeSelection {
  selected: boolean;
  disabled: boolean;
}

/**
 * Card di un badge. Senza `selection` apre il dettaglio (stellina se in evidenza);
 * con `selection` diventa una card selezionabile (selettore badge in evidenza).
 */
export function BadgeItem({
  badge,
  onSelect,
  selection,
  showFeaturedMark = true,
}: {
  badge: BadgeWithStatus;
  onSelect: (badge: BadgeWithStatus) => void;
  selection?: BadgeSelection;
  showFeaturedMark?: boolean;
}) {
  const { t } = useTranslation();
  const isSelected = selection?.selected ?? false;

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(badge)}
      disabled={selection?.disabled}
      aria-pressed={selection ? isSelected : undefined}
      aria-label={
        badge.unlocked
          ? badge.title
          : t("badges.lockedLabel", { title: badge.title })
      }
      className={cn(
        "relative h-auto w-full flex-col items-center justify-start gap-2 whitespace-normal rounded-2xl border border-transparent bg-card px-2 pb-3 pt-3 font-normal hover:bg-card disabled:opacity-100",
        isSelected && "border-primary bg-accent hover:bg-accent",
      )}
    >
      {selection && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full border",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-background",
          )}
        >
          {isSelected && <Check className="size-3" strokeWidth={3} />}
        </span>
      )}

      {!selection && showFeaturedMark && badge.is_featured && (
        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Star className="size-3 fill-current" aria-hidden="true" />
        </span>
      )}

      <BadgeIcon
        iconKey={badge.icon_key}
        locked={!badge.unlocked}
        className="size-16"
      />

      <span className="flex flex-col gap-0.5 text-center">
        <span
          className={cn(
            "line-clamp-2 text-[13px] font-semibold leading-tight",
            badge.unlocked ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {badge.title}
        </span>
        <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
          {badge.description}
        </span>
      </span>
    </Button>
  );
}
