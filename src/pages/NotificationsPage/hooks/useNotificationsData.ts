import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteNotification,
  markAllAsRead,
  markAsRead,
  type AppNotification,
} from "@/api/notifications";
import { useNotifications } from "@/hooks/useNotifications";

export function useNotificationsData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, notifications, isLoading, unreadCount } = useNotifications();
  const key = ["notifications", userId];

  /**
   * Mutation con aggiornamento ottimistico della lista in cache e rollback in
   * caso di errore.
   */
  function useOptimisticMutation<V>(
    mutationFn: (variables: V) => Promise<void>,
    update: (list: AppNotification[], variables: V) => AppNotification[],
  ) {
    return useMutation({
      mutationFn,
      onMutate: async (variables: V) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<AppNotification[]>(key);
        queryClient.setQueryData<AppNotification[]>(key, (list) =>
          list ? update(list, variables) : list,
        );
        return { previous };
      },
      onError: (_error, _variables, context) => {
        queryClient.setQueryData(key, context?.previous);
        toast.error(t("common.error"));
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
    }).mutate;
  }

  const readAt = () => new Date().toISOString();

  const read = useOptimisticMutation(markAsRead, (list, id: string) =>
    list.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: readAt() } : n)),
  );
  const readAll = useOptimisticMutation(
    () => markAllAsRead(),
    (list) => list.map((n) => (n.read_at ? n : { ...n, read_at: readAt() })),
  );
  const remove = useOptimisticMutation(deleteNotification, (list, id: string) =>
    list.filter((n) => n.id !== id),
  );

  function open(notification: AppNotification) {
    if (!notification.read_at) read(notification.id);
    switch (notification.type) {
      case "badge_unlocked":
        navigate("/profile/badges");
        break;
      case "goal_renewal":
        navigate("/goals");
        break;
      case "book_release":
        navigate(`/book/${notification.payload.library_item_id}`);
        break;
    }
  }

  return {
    data: {
      notifications,
      isLoading,
      unreadCount,
      isEmpty: !isLoading && notifications.length === 0,
    },
    ui: {},
    actions: {
      goBack: () => navigate(-1),
      open,
      remove,
      readAll: () => readAll(undefined),
    },
  };
}
