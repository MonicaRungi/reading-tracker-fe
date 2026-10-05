export type ShelfNameError = "required" | "taken";

/**
 * Validazione lato client del nome scaffale. L'unicità per utente la
 * garantisce il DB (unique user_id, name): l'errore "taken" arriva dal submit.
 */
export function validateShelfName(name: string): ShelfNameError | null {
  return name.trim().length === 0 ? "required" : null;
}
