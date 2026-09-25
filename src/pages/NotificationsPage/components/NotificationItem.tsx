import { useTranslation } from "react-i18next";
import { BadgeIcon } from "@/components/shared/BadgeIcon";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/notifications";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationItem({
  notification,
  onSelect,
}: {
  notification: AppNotification;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      className={cn(
        "h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl px-3 py-3 text-left font-normal",
        notification.read ? "hover:bg-secondary" : "bg-accent hover:bg-accent",
      )}
    >
      <BadgeIcon
        iconKey={notification.icon_key}
        locked={false}
        className="size-12"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-muted-foreground">
          {t("notifications.badgeUnlocked")}
        </span>
        <span className="block truncate text-[15px] font-semibold text-foreground">
          {notification.title || t("notifications.badgeUnlockedGeneric")}
        </span>
        <span className="block text-[12px] text-muted-foreground">
          {formatDate(notification.created_at)}
        </span>
      </span>
      {!notification.read && (
        <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      )}
    </Button>
  );
}
