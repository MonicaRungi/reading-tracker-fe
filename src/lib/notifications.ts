/**
 * Notifiche in-app salvate solo in localStorage, per utente e per dispositivo.
 * Nessun backend: è uno store minimale compatibile con `useSyncExternalStore`.
 */

export interface AppNotification {
  id: string;
  type: "badge_unlocked";
  badge_id: string;
  title: string;
  icon_key: string;
  created_at: string;
  read: boolean;
}

export type NewNotification = Omit<AppNotification, "id" | "created_at" | "read">;

const MAX_NOTIFICATIONS = 50;
const EMPTY: AppNotification[] = [];

const notificationsKey = (userId: string) => `rt.notifications.${userId}`;
const seenBadgesKey = (userId: string) => `rt.seenBadges.${userId}`;

const cache = new Map<string, AppNotification[]>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage pieno o bloccato (navigazione privata): resta solo in memoria.
  }
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Altre schede della stessa app: invalida la cache e notifica.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith("rt.notifications.")) return;
    cache.delete(event.key.slice("rt.notifications.".length));
    emit();
  });
}

/** Snapshot stabile (stesso array finché non cambia) per `useSyncExternalStore`. */
export function getNotifications(userId: string): AppNotification[] {
  if (!userId) return EMPTY;
  let list = cache.get(userId);
  if (!list) {
    const stored = readJson<AppNotification[]>(notificationsKey(userId));
    list = Array.isArray(stored) ? stored : EMPTY;
    cache.set(userId, list);
  }
  return list;
}

function setNotifications(userId: string, list: AppNotification[]) {
  cache.set(userId, list);
  writeJson(notificationsKey(userId), list);
  emit();
}

export function addNotifications(userId: string, items: NewNotification[]) {
  if (!userId || items.length === 0) return;
  const current = getNotifications(userId);
  const existing = new Set(current.map((n) => n.id));
  const createdAt = new Date().toISOString();
  const fresh = items
    .map((item) => ({
      ...item,
      id: `${item.type}:${item.badge_id}`,
      created_at: createdAt,
      read: false,
    }))
    .filter((n) => !existing.has(n.id));
  if (fresh.length === 0) return;
  setNotifications(userId, [...fresh, ...current].slice(0, MAX_NOTIFICATIONS));
}

export function markAllNotificationsRead(userId: string) {
  const current = getNotifications(userId);
  if (!current.some((n) => !n.read)) return;
  setNotifications(
    userId,
    current.map((n) => (n.read ? n : { ...n, read: true })),
  );
}

/** Badge già visti su questo dispositivo; null se non è mai stato inizializzato. */
export function getSeenBadgeIds(userId: string): string[] | null {
  const stored = readJson<string[]>(seenBadgesKey(userId));
  return Array.isArray(stored) ? stored : null;
}

export function setSeenBadgeIds(userId: string, ids: string[]) {
  writeJson(seenBadgesKey(userId), ids);
}
