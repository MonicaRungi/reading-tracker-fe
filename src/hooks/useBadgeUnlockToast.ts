import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listBadgeCatalog, listUserBadges } from "@/api/badges";
import type { UserBadge } from "@/api/badges";
import { useAuth } from "@/hooks/useAuth";
import { findNewlyUnlocked } from "@/lib/badges";
import { BADGE_CATALOG_STALE_TIME } from "@/lib/progressQueries";

/**
 * Osserva ['user-badges', userId] e mostra un toast discreto quando dopo un
 * refetch compare un badge che prima non c'era. Nessun evento realtime:
 * il confronto è prima/dopo lato client.
 */
export function useBadgeUnlockToast() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const previous = useRef<{ userId: string; badges: UserBadge[] } | null>(
    null,
  );

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
    if (!userId || !userBadges) return;

    const before =
      previous.current?.userId === userId ? previous.current.badges : null;
    previous.current = { userId, badges: userBadges };
    if (!before) return;

    const fresh = findNewlyUnlocked(before, userBadges);
    if (fresh.length === 0) return;

    const byId = new Map(catalog?.map((b) => [b.id, b]));
    // Gli annuali vengono aggiunti al catalogo al primo sblocco.
    if (fresh.some((ub) => !byId.has(ub.badge_id))) {
      void queryClient.invalidateQueries({ queryKey: ["badges-catalog"] });
    }

    for (const ub of fresh) {
      const badge = byId.get(ub.badge_id);
      toast.success(
        badge
          ? t("badges.unlockedToast", { title: badge.title })
          : t("badges.unlockedToastGeneric"),
      );
    }
  }, [userId, userBadges, catalog, queryClient, t]);
}
