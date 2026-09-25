import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BackHeader } from "@/components/shared/BackHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SwipeToDelete } from "@/components/shared/SwipeToDelete";
import { Button } from "@/components/ui/button";
import { useNotificationsData } from "./hooks/useNotificationsData";
import { NotificationItem } from "./components/NotificationItem";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { data, actions } = useNotificationsData();

  return (
    <div className="flex min-h-full flex-col">
      <BackHeader
        title={t("notifications.title")}
        onBack={actions.goBack}
        action={
          data.unreadCount > 0 ? (
            <Button
              variant="link"
              onClick={actions.readAll}
              className="h-auto p-0 text-[13px] font-medium"
            >
              {t("notifications.markAllRead")}
            </Button>
          ) : null
        }
      />

      {data.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : data.isEmpty ? (
        <EmptyState
          size="lg"
          icon={Bell}
          title={t("notifications.empty")}
          description={t("notifications.emptySub")}
        />
      ) : (
        <div className="pb-8 pt-2">
          <div className="divide-y divide-border border-y border-border">
            {data.notifications.map((notification) => (
              <SwipeToDelete
                key={notification.id}
                label={t("notifications.deleteAction")}
                onDelete={() => actions.remove(notification.id)}
              >
                <NotificationItem
                  notification={notification}
                  onOpen={() => actions.open(notification)}
                />
              </SwipeToDelete>
            ))}
          </div>
          <p className="px-4 pt-3 text-center text-[12px] text-muted-foreground">
            {t("notifications.swipeHint")} {t("notifications.retentionHint")}
          </p>
        </div>
      )}
    </div>
  );
}
