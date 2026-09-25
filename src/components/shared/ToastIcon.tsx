import type { LucideIcon } from "lucide-react";
import { BadgeIcon } from "@/components/shared/BadgeIcon";

/** Icona grande per i toast "evento": immagine del badge o icona in cerchio corallo. */
export function ToastIcon({
  badgeIconKey,
  icon: Icon,
}: {
  badgeIconKey?: string;
  icon?: LucideIcon;
}) {
  if (badgeIconKey) {
    return <BadgeIcon iconKey={badgeIconKey} locked={false} className="size-10" />;
  }
  if (!Icon) return null;
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-accent">
      <Icon className="size-5 text-primary" aria-hidden="true" />
    </div>
  );
}
