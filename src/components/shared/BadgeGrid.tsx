import type { BadgeWithStatus } from "@/api/badges";
import { BadgeItem, type BadgeSelection } from "@/components/shared/BadgeItem";

/** Griglia di badge: ottenuti e da sbloccare sempre mostrati insieme. */
export function BadgeGrid({
  badges,
  onSelect,
  getSelection,
  showFeaturedMark,
}: {
  badges: BadgeWithStatus[];
  onSelect: (badge: BadgeWithStatus) => void;
  getSelection?: (badge: BadgeWithStatus) => BadgeSelection;
  showFeaturedMark?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {badges.map((badge) => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          onSelect={onSelect}
          selection={getSelection?.(badge)}
          showFeaturedMark={showFeaturedMark}
        />
      ))}
    </div>
  );
}
