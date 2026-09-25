import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LibraryHeader({
  unreadCount,
  onOpenNotifications,
}: {
  unreadCount: number;
  onOpenNotifications: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-[-1px] z-20 flex h-16 items-center justify-between bg-background px-4">
      <h1 className="text-[30px] font-bold text-foreground">
        {t("library.title")}
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenNotifications}
        aria-label={
          unreadCount > 0
            ? t("notifications.bellUnread", { count: unreadCount })
            : t("notifications.bell")
        }
        className="relative h-9 w-9 rounded-full bg-secondary text-muted-foreground"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-primary ring-2 ring-secondary"
          />
        )}
      </Button>
    </div>
  );
}
