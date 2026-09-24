/**
 * Feedback aptico breve. Usa la Vibration API dove disponibile (Android);
 * su iOS Safari e desktop non è supportata e la chiamata è un no-op.
 */
export function hapticFeedback(pattern: number | number[] = 50): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Alcuni browser lanciano se la vibrazione è bloccata: ignoriamo.
  }
}
