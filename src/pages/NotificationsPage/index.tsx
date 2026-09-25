import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BackHeader } from "@/components/shared/BackHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNotificationsData } from "./hooks/useNotificationsData";
import { NotificationItem } from "./components/NotificationItem";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { data, actions } = useNotificationsData();

  return (
    <div className="flex min-h-full flex-col">
      <BackHeader title={t("notifications.title")} onBack={actions.goBack} />

      {data.isEmpty ? (
        <EmptyState
          size="lg"
          icon={Bell}
          title={t("notifications.empty")}
          description={t("notifications.emptySub")}
        />
      ) : (
        <div className="space-y-2 px-4 pb-8 pt-2">
          {data.notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onSelect={actions.openBadges}
            />
          ))}
          <p className="pt-3 text-center text-[12px] text-muted-foreground">
            {t("notifications.localHint")}
          </p>
        </div>
      )}
    </div>
  );
}
