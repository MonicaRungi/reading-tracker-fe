import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listBadgeCatalog, listUserBadges } from "@/api/badges";
import { useAuth } from "@/hooks/useAuth";
import { findNewlyUnlocked } from "@/lib/badges";
import {
  addNotifications,
  getSeenBadgeIds,
  setSeenBadgeIds,
} from "@/lib/notifications";
import { BADGE_CATALOG_STALE_TIME } from "@/lib/progressQueries";
import { showStackedSuccessToasts } from "@/lib/toastStack";


/**
 * Osserva ['user-badges', userId] e, quando compare un badge non ancora visto su
 * questo dispositivo, mostra un toast discreto e salva una notifica locale.
 * I badge visti sono persistiti, quindi vengono notificati anche gli sblocchi
 * avvenuti ad app chiusa (es. obiettivo annuale chiuso dal job). Al primo avvio
 * l'elenco viene solo inizializzato, senza notificare lo storico.
 */
export function useBadgeUnlockToast() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const refetchedCatalogFor = useRef(new Set<string>());

  const { data: userBadges } = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: () => listUserBadges(),
    enabled: Boolean(userId),
  });

  const { data: catalog } = useQuery({
    queryKey: ["badges-catalog"],
    queryFn: () => listBadgeCatalog(),
    staleTime: BADGE_CATALOG_STALE_TIME,
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!userId || !userBadges || !catalog) return;

    const currentIds = userBadges.map((ub) => ub.badge_id);
    const seen = getSeenBadgeIds(userId);
    if (seen === null) {
      setSeenBadgeIds(userId, currentIds);
      return;
    }

    const fresh = findNewlyUnlocked(seen, userBadges);
    if (fresh.length === 0) return;

    const byId = new Map(catalog.map((b) => [b.id, b]));
    // Gli annuali entrano nel catalogo al primo sblocco: un refetch, poi si procede.
    const missing = fresh.filter(
      (ub) =>
        !byId.has(ub.badge_id) && !refetchedCatalogFor.current.has(ub.badge_id),
    );
    if (missing.length > 0) {
      for (const ub of missing) refetchedCatalogFor.current.add(ub.badge_id);
      void queryClient.invalidateQueries({ queryKey: ["badges-catalog"] });
      return;
    }

    setSeenBadgeIds(userId, currentIds);
    addNotifications(
      userId,
      fresh.map((ub) => {
        const badge = byId.get(ub.badge_id);
        return {
          type: "badge_unlocked" as const,
          badge_id: ub.badge_id,
          title: badge?.title ?? "",
          icon_key: badge?.icon_key ?? "",
        };
      }),
    );
    showStackedSuccessToasts(
      fresh.map((ub) => {
        const badge = byId.get(ub.badge_id);
        return {
          id: `badge-unlocked:${ub.badge_id}`,
          message: badge
            ? t("badges.unlockedToast", { title: badge.title })
            : t("badges.unlockedToastGeneric"),
        };
      }),
    );
  }, [userId, userBadges, catalog, queryClient, t]);
}
