import type { QueryClient } from "@tanstack/react-query";

/** staleTime lungo per il catalogo badge: cambia raramente. */
export const BADGE_CATALOG_STALE_TIME = 24 * 60 * 60 * 1000;

/**
 * Obiettivi e badge dipendono da library_items e reading_goals: i badge si
 * sbloccano via trigger come effetto collaterale. Da chiamare dopo ogni
 * mutation che tocca libreria, avanzamento o obiettivi.
 */
export function invalidateProgressQueries(
  queryClient: QueryClient,
  userId: string | undefined,
): Promise<unknown> {
  return Promise.all(
    ["goals", "goal-progress", "user-badges", "badge-progress"].map((key) =>
      queryClient.invalidateQueries({ queryKey: [key, userId] }),
    ),
  );
}
