import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "@/api/notifications";
import { useAuth } from "@/hooks/useAuth";

/** Notifiche dell'utente (tabella `notifications`), aggiornate via realtime. */
export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => listNotifications(),
    enabled: Boolean(userId),
  });

  return {
    userId,
    notifications,
    isLoading,
    unreadCount: notifications.filter((n) => !n.read_at).length,
  };
}
