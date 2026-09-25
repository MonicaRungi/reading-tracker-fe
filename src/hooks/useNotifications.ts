import { useSyncExternalStore } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getNotifications,
  markAllNotificationsRead,
  subscribeNotifications,
} from "@/lib/notifications";

/** Notifiche in-app dell'utente corrente (solo locali, vedi `lib/notifications.ts`). */
export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const notifications = useSyncExternalStore(subscribeNotifications, () =>
    getNotifications(userId),
  );

  return {
    userId,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAllRead: () => markAllNotificationsRead(userId),
  };
}
