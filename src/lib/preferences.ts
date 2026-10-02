/**
 * Preferenze di visualizzazione per dispositivo, salvate in localStorage
 * (come `rt.theme`). Se lo storage non è disponibile vale il default.
 */

export function getBooleanPreference(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

export function setBooleanPreference(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // storage non disponibile: la scelta vale solo per la sessione
  }
}
