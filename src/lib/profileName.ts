/**
 * Nome da mostrare per l'utente, nell'ordine:
 * 1. `profiles.display_name` (scelto dall'utente, o copiato da Google alla registrazione)
 * 2. nome dai metadati dell'account (Google: `full_name` / `name`)
 * 3. parte dell'email prima della @
 */
export function resolveDisplayName({
  profileName,
  metadata,
  email,
}: {
  profileName?: string | null;
  metadata?: Record<string, unknown> | null;
  email?: string | null;
}): string {
  const fromMetadata = [metadata?.full_name, metadata?.name].find(
    (value): value is string => typeof value === "string" && value.trim() !== "",
  );
  return (
    profileName?.trim() ||
    fromMetadata?.trim() ||
    (email ? email.split("@")[0] : "")
  );
}

/** Iniziali di nome e cognome ("Monica Rungi" → "MR"); una sola parola → prime due lettere. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
