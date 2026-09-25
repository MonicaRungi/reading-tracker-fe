import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { markAllNotificationsRead } from "@/lib/notifications";

export function useNotificationsData() {
  const navigate = useNavigate();
  const { userId, notifications } = useNotifications();

  // Le notifiche restano evidenziate mentre l'utente le guarda e risultano
  // lette quando lascia la pagina.
  useEffect(() => () => markAllNotificationsRead(userId), [userId]);

  return {
    data: { notifications, isEmpty: notifications.length === 0 },
    ui: {},
    actions: {
      goBack: () => navigate(-1),
      openBadges: () => navigate("/profile/badges"),
    },
  };
}
