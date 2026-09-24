import type {
  Badge,
  BadgeCategory,
  BadgeWithStatus,
  UserBadge,
  UserProgress,
} from "@/api/badges";

export const MAX_FEATURED_BADGES = 6;

export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  "annual",
  "books",
  "pages",
  "long_books",
  "goals",
];

const ANNUAL_KEY_PREFIX = "annual_reader_";

export function annualBadgeKey(year: number): string {
  return `${ANNUAL_KEY_PREFIX}${year}`;
}

export function annualBadgeYear(badge: Pick<Badge, "key">): number | null {
  if (!badge.key.startsWith(ANNUAL_KEY_PREFIX)) return null;
  const year = Number(badge.key.slice(ANNUAL_KEY_PREFIX.length));
  return Number.isFinite(year) ? year : null;
}

export function badgeIconUrl(iconKey: string): string {
  return `/badges/${iconKey}.png`;
}

interface CombineOptions {
  currentYear: number;
  /** Anni in cui l'obiettivo annuale principale è fallito. */
  failedAnnualYears: Set<number>;
  /**
   * Testi per il badge annuale dell'anno corrente quando nessuno l'ha ancora
   * ottenuto (il DB genera la riga nel catalogo solo al primo sblocco).
   */
  annualPlaceholder: { title: string; description: string };
}

/**
 * Unisce catalogo, sblocchi utente e metriche correnti.
 * - Badge a soglia: progress = min(1, valore / soglia).
 * - Annuali: binari (progress null). Si mostrano quello dell'anno corrente,
 *   quelli ottenuti e quelli degli anni con obiettivo fallito (scaduti).
 */
export function combineBadges(
  catalog: Badge[],
  userBadges: UserBadge[],
  progress: UserProgress | undefined,
  { currentYear, failedAnnualYears, annualPlaceholder }: CombineOptions,
): BadgeWithStatus[] {
  const unlockedById = new Map(userBadges.map((ub) => [ub.badge_id, ub]));

  const withCurrentAnnual = catalog.some(
    (b) => b.key === annualBadgeKey(currentYear),
  )
    ? catalog
    : [
        ...catalog,
        {
          id: annualBadgeKey(currentYear),
          key: annualBadgeKey(currentYear),
          category: "annual" as const,
          tier: null,
          title: annualPlaceholder.title,
          description: annualPlaceholder.description,
          metric: null,
          threshold: null,
          icon_key: annualBadgeKey(currentYear),
        },
      ];

  const result: BadgeWithStatus[] = [];

  for (const badge of withCurrentAnnual) {
    const userBadge = unlockedById.get(badge.id);
    const unlocked = Boolean(userBadge);
    const year = annualBadgeYear(badge);

    if (badge.category === "annual" && !unlocked) {
      const isCurrent = year === currentYear;
      const isFailed = year !== null && failedAnnualYears.has(year);
      if (!isCurrent && !isFailed) continue;
    }

    const current =
      badge.metric && progress ? progress[badge.metric] : null;
    const ratio =
      badge.threshold && current !== null
        ? Math.min(1, current / badge.threshold)
        : null;

    result.push({
      ...badge,
      unlocked,
      unlocked_at: userBadge?.unlocked_at ?? null,
      is_featured: userBadge?.is_featured ?? false,
      current,
      progress: unlocked && ratio !== null ? 1 : ratio,
      is_expired:
        badge.category === "annual" &&
        !unlocked &&
        year !== null &&
        year < currentYear,
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
