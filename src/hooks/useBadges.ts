import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUserProgress,
  listBadgeCatalog,
  listUserBadges,
  toggleFeatured,
  type BadgeProgressInfo,
  type BadgeWithStatus,
  type UserBadge,
} from "@/api/badges";
import { MAX_FEATURED_BADGES, combineBadges } from "@/lib/badges";
import { BADGE_CATALOG_STALE_TIME } from "@/lib/progressQueries";

/** Badge dell'utente: vetrina, griglia, dettaglio e selettore "in evidenza". Usato da Profilo e pagina Badge. */
export function useBadges(userId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userBadgesKey = ["user-badges", userId];

  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [pickerDraft, setPickerDraft] = useState<string[] | null>(null);

  const { data: catalog, isLoading: isLoadingCatalog } = useQuery({
    queryKey: ["badges-catalog"],
    queryFn: () => listBadgeCatalog(),
    staleTime: BADGE_CATALOG_STALE_TIME,
    enabled: Boolean(userId),
  });

  const { data: userBadges, isLoading: isLoadingUserBadges } = useQuery({
    queryKey: userBadgesKey,
    queryFn: () => listUserBadges(),
    enabled: Boolean(userId),
  });

  const { data: metrics } = useQuery({
    queryKey: ["badge-progress", userId],
    queryFn: () => getUserProgress(),
    enabled: Boolean(userId),
  });

  const badges =
    catalog && userBadges ? combineBadges(catalog, userBadges, metrics) : [];

  const featuredBadges = badges.filter((b) => b.is_featured);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const selectedBadge = badges.find((b) => b.id === selectedBadgeId) ?? null;

  function progressFor(badge: BadgeWithStatus): BadgeProgressInfo | null {
    if (!badge.metric || badge.threshold === null) return null;
    return {
      metric: badge.metric,
      current: Math.min(badge.current ?? 0, badge.threshold),
      target: badge.threshold,
    };
  }

  // --- Toggle singolo (dal dettaglio) -------------------------------------

  const { mutate: mutateFeatured, isPending: isTogglingFeatured } = useMutation({
    mutationFn: ({ badgeId, featured }: { badgeId: string; featured: boolean }) =>
      toggleFeatured(badgeId, featured),
    onMutate: async ({ badgeId, featured }) => {
      await queryClient.cancelQueries({ queryKey: userBadgesKey });
      const previous = queryClient.getQueryData<UserBadge[]>(userBadgesKey);
      queryClient.setQueryData<UserBadge[]>(userBadgesKey, (current) =>
        current?.map((ub) =>
          ub.badge_id === badgeId ? { ...ub, is_featured: featured } : ub,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(userBadgesKey, context?.previous);
      toast.error(t("common.error"));
    },
    onSuccess: (_data, { featured }) => {
      toast.success(
        featured ? t("badges.featuredAdded") : t("badges.featuredRemoved"),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userBadgesKey }),
  });

  function toggleBadgeFeatured(badge: BadgeWithStatus) {
    if (!badge.unlocked) return;
    if (!badge.is_featured && featuredBadges.length >= MAX_FEATURED_BADGES) {
      return;
    }
    mutateFeatured({ badgeId: badge.id, featured: !badge.is_featured });
  }

  // --- Selettore "Scegli badge in evidenza" -------------------------------

  const { mutate: savePicker, isPending: isSavingPicker } = useMutation({
    mutationFn: (draft: string[]) => {
      const next = new Set(draft);
      const changes = badges.filter(
        (b) => b.unlocked && b.is_featured !== next.has(b.id),
      );
      return Promise.all(
        changes.map((b) => toggleFeatured(b.id, next.has(b.id))),
      );
    },
    onSuccess: () => {
      toast.success(t("badges.featuredSaved"));
      setPickerDraft(null);
    },
    onError: () => toast.error(t("common.error")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: userBadgesKey }),
  });

  function togglePickerBadge(badge: BadgeWithStatus) {
    if (!badge.unlocked) return;
    setPickerDraft((draft) => {
      if (!draft) return draft;
      if (draft.includes(badge.id)) return draft.filter((id) => id !== badge.id);
      return draft.length < MAX_FEATURED_BADGES ? [...draft, badge.id] : draft;
    });
  }

  return {
    data: {
      badges,
      featuredBadges,
      badgeCount: badges.length,
      unlockedBadgeCount: unlockedCount,
      isLoadingBadges: isLoadingCatalog || isLoadingUserBadges,
      selectedBadge,
      selectedBadgeProgress: selectedBadge ? progressFor(selectedBadge) : null,
      canFeatureMore: featuredBadges.length < MAX_FEATURED_BADGES,
      maxFeatured: MAX_FEATURED_BADGES,
      pickerDraft: pickerDraft ?? [],
    },
    ui: {
      isTogglingFeatured,
      isPickerOpen: pickerDraft !== null,
      isSavingPicker,
    },
    actions: {
      openBadge: (badge: BadgeWithStatus) => setSelectedBadgeId(badge.id),
      closeBadge: () => setSelectedBadgeId(null),
      toggleBadgeFeatured,
      openPicker: () => setPickerDraft(featuredBadges.map((b) => b.id)),
      closePicker: () => setPickerDraft(null),
      togglePickerBadge,
      savePicker: () => pickerDraft && savePicker(pickerDraft),
    },
  };
}
