import { PartyPopper, Target } from "lucide-react";
import type { AppNotification } from "@/api/notifications";
import { BadgeIcon } from "@/components/shared/BadgeIcon";

export function NotificationIcon({ notification }: { notification: AppNotification }) {
  if (notification.type === "badge_unlocked") {
    return (
      <BadgeIcon
        iconKey={notification.payload.icon_key}
        locked={false}
        className="size-12"
      />
    );
  }

  const Icon = notification.type === "goal_renewal" ? Target : PartyPopper;
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent">
      <Icon className="size-5 text-primary" aria-hidden="true" />
    </div>
  );
}
