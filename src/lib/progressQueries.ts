import type { QueryClient } from "@tanstack/react-query";
import { syncGoalAchievements } from "@/api/goals";

/** staleTime lungo per il catalogo badge: cambia raramente. */
export const BADGE_CATALOG_STALE_TIME = 24 * 60 * 60 * 1000;

/**
 * Da chiamare dopo ogni mutation che tocca libreria, avanzamento o obiettivi.
 * 1. Chiude subito come 'achieved' gli obiettivi attivi che hanno raggiunto il
 *    target (i badge obiettivi/annuale si sbloccano via trigger DB).
 * 2. Invalida obiettivi e badge, che dipendono da library_items/reading_goals.
 * Un errore nella chiusura non blocca l'invalidazione: ci riprova la prossima
 * azione, o il job notturno a fine periodo.
 */
export async function invalidateProgressQueries(
  queryClient: QueryClient,
  userId: string | undefined,
): Promise<unknown> {
  try {
    await syncGoalAchievements();
  } catch {
    // silenzioso: vedi sopra
  }
  return Promise.all(
    ["goals", "goal-progress", "user-badges", "badge-progress"].map((key) =>
      queryClient.invalidateQueries({ queryKey: [key, userId] }),
    ),
  );
}
