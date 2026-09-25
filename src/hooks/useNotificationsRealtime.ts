import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { createElement } from "react";
import { PartyPopper } from "lucide-react";
import { parseNotification } from "@/api/notifications";
import type { NotificationRow } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { showStackedSuccessToasts } from "@/lib/toastStack";
import { ToastIcon } from "@/components/shared/ToastIcon";

/**
 * Subscription realtime su INSERT in `notifications` per l'utente corrente.
 * Il filtro `user_id=eq.…` è solo un'ottimizzazione: il confine di sicurezza è
 * la RLS (select own notifications). Da montare una volta per layout.
 * - badge sbloccato → toast "first in, last out" + refresh dei badge
 * - libro uscito → toast
 * - rinnovo obiettivo → nessun toast (invito discreto, vedi pagina Obiettivi)
 */
export function useNotificationsRealtime() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (event) => {
          void queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
          const notification = parseNotification(event.new as NotificationRow);
          if (!notification) return;

          if (notification.type === "badge_unlocked") {
            showStackedSuccessToasts([
              {
                id: `badge-unlocked:${notification.payload.badge_id}`,
                message: t("notifications.badgeUnlocked"),
                description: notification.payload.badge_title,
                icon: createElement(ToastIcon, {
                  badgeIconKey: notification.payload.icon_key,
                }),
              },
            ]);
            for (const key of ["user-badges", "badge-progress"]) {
              void queryClient.invalidateQueries({ queryKey: [key, userId] });
            }
            // gli annuali entrano nel catalogo al primo sblocco
            void queryClient.invalidateQueries({ queryKey: ["badges-catalog"] });
          } else if (notification.type === "book_release") {
            showStackedSuccessToasts([
              {
                id: `book-release:${notification.id}`,
                message: t("notifications.bookRelease"),
                description: notification.payload.book_title,
                icon: createElement(ToastIcon, { icon: PartyPopper }),
              },
            ]);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient, t]);
}
