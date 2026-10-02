/** Durata del riempimento animato delle barre di avanzamento. */
export const PROGRESS_FILL_MS = 1200

/**
 * Ease-out cubica: in CSS è `cubic-bezier(0.33, 1, 0.68, 1)`, in JS questa
 * funzione. Usarle in coppia tiene sincronizzate barra e numero.
 */
export const EASE_OUT_CUBIC_CSS = "cubic-bezier(0.33, 1, 0.68, 1)"
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}
