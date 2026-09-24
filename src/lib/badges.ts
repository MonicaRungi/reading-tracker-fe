import type {
  Badge,
  BadgeCategory,
  BadgeWithStatus,
  UserBadge,
  UserProgress,
} from "@/api/badges";

export const MAX_FEATURED_BADGES = 3;

export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  "annual",
  "books",
  "pages",
  "long_books",
  "goals",
];

const ANNUAL_KEY_PREFIX = "annual_reader_";

export function annualBadgeYear(badge: Pick<Badge, "key">): number | null {
  if (!badge.key.startsWith(ANNUAL_KEY_PREFIX)) return null;
  const year = Number(badge.key.slice(ANNUAL_KEY_PREFIX.length));
  return Number.isFinite(year) ? year : null;
}

export function badgeIconUrl(iconKey: string): string {
  return `/badges/${iconKey}.png`;
}

/**
 * Unisce catalogo, sblocchi utente e metriche correnti.
 * - Badge a soglia: progress = min(1, valore / soglia).
 * - Annuali: compaiono solo una volta ottenuti (sono una sorpresa).
 */
export function combineBadges(
  catalog: Badge[],
  userBadges: UserBadge[],
  progress: UserProgress | undefined,
): BadgeWithStatus[] {
  const unlockedById = new Map(userBadges.map((ub) => [ub.badge_id, ub]));
  const result: BadgeWithStatus[] = [];

  for (const badge of catalog) {
    const userBadge = unlockedById.get(badge.id);
    if (badge.category === "annual" && !userBadge) continue;

    const current =
      badge.metric && progress ? progress[badge.metric] : null;
    const ratio =
      badge.threshold && current !== null
        ? Math.min(1, current / badge.threshold)
        : null;

    result.push({
      ...badge,
      unlocked: Boolean(userBadge),
      unlocked_at: userBadge?.unlocked_at ?? null,
      is_featured: userBadge?.is_featured ?? false,
      current,
      progress: userBadge && ratio !== null ? 1 : ratio,
    });
  }

  return result.sort((a, b) => {
    const byCategory =
      BADGE_CATEGORY_ORDER.indexOf(a.category) -
      BADGE_CATEGORY_ORDER.indexOf(b.category);
    if (byCategory !== 0) return byCategory;
    if (a.category === "annual") {
      return (annualBadgeYear(b) ?? 0) - (annualBadgeYear(a) ?? 0);
    }
    return (a.threshold ?? 0) - (b.threshold ?? 0);
  });
}

/** Badge presenti in `after` ma non in `before` (per la celebrazione). */
export function findNewlyUnlocked(
  before: UserBadge[],
  after: UserBadge[],
): UserBadge[] {
  const known = new Set(before.map((ub) => ub.badge_id));
  return after.filter((ub) => !known.has(ub.badge_id));
}
