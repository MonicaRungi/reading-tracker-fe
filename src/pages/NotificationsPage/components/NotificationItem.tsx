import { useTranslation } from "react-i18next";
import type { AppNotification } from "@/api/notifications";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NotificationIcon } from "./NotificationIcon";

export function NotificationItem({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const isUnread = !notification.read_at;

  const { label, title } = (() => {
    switch (notification.type) {
      case "badge_unlocked":
        return {
          label: t("notifications.badgeUnlocked"),
          title: notification.payload.badge_title || t("notifications.badgeUnlockedGeneric"),
        };
      case "goal_renewal":
        return {
          label:
            notification.payload.status === "achieved"
              ? t("notifications.goalRenewalAchieved")
              : t("notifications.goalRenewalConcluded"),
          title: t(`goals.detail.goalTitle.${notification.payload.goal_type}`, {
            count: notification.payload.target,
          }),
        };
      case "book_release":
        return {
          label: t("notifications.bookRelease"),
          title: notification.payload.book_title,
        };
    }
  })();

  const hint =
    notification.type === "goal_renewal" ? t("notifications.goalRenewalHint") : null;

  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      className={cn(
        "h-auto w-full justify-start gap-3 whitespace-normal rounded-none px-4 py-3.5 text-left font-normal",
        isUnread ? "bg-accent hover:bg-accent" : "hover:bg-secondary",
      )}
    >
      <NotificationIcon notification={notification} />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-muted-foreground">{label}</span>
        <span className="block truncate text-[15px] font-semibold text-foreground">
          {title}
        </span>
        {hint && (
          <span className="block text-[12px] text-muted-foreground">{hint}</span>
        )}
        <span className="block text-[12px] text-muted-foreground">
          {formatDate(notification.created_at)}
        </span>
      </span>
      {isUnread && (
        <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      )}
    </Button>
  );
}
