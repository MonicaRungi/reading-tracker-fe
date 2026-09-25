/**
 * Inviti al rinnovo chiusi dall'utente, per goal concluso (goalId), salvati solo
 * in localStorage come le notifiche. Chiudere l'invito di un goal "pagine" non
 * nasconde quello del prossimo goal "pagine".
 */

const EMPTY: string[] = [];
const key = (userId: string) => `rt.dismissedRenewals.${userId}`;
const cache = new Map<string, string[]>();
const listeners = new Set<() => void>();

export function subscribeRenewalDismissals(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDismissedRenewals(userId: string): string[] {
  if (!userId) return EMPTY;
  let ids = cache.get(userId);
  if (!ids) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key(userId)) ?? "null");
      ids = Array.isArray(parsed) ? (parsed as string[]) : EMPTY;
    } catch {
      ids = EMPTY;
    }
    cache.set(userId, ids);
  }
  return ids;
}

export function dismissRenewal(userId: string, goalId: string) {
  if (!userId) return;
  const current = getDismissedRenewals(userId);
  if (current.includes(goalId)) return;
  // Tiene solo gli ultimi 20: gli inviti hanno vita breve.
  const next = [goalId, ...current].slice(0, 20);
  cache.set(userId, next);
  try {
    localStorage.setItem(key(userId), JSON.stringify(next));
  } catch {
    // storage non disponibile: resta in memoria
  }
  for (const listener of listeners) listener();
}
