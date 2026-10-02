import { useEffect, useState } from "react"
import {
  EASE_OUT_CUBIC_CSS,
  PROGRESS_FILL_MS,
  prefersReducedMotion,
} from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Barra di avanzamento. Con `animate` si riempie da 0 al valore al mount;
 * `onFilled` scatta quando l'animazione arriva al 100% (subito se l'utente
 * ha attivo "riduci movimento", dato che la transizione è disattivata).
 */
export function ProgressBar({
  percent,
  animate = false,
  onFilled,
}: {
  percent: number
  animate?: boolean
  onFilled?: () => void
}) {
  const clamped = Math.min(100, Math.max(0, percent))
  const [isMounted, setIsMounted] = useState(!animate)

  useEffect(() => {
    if (!animate) return
    // Doppio rAF: il primo frame dipinge la barra vuota, il secondo avvia la transizione.
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setIsMounted(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [animate])

  useEffect(() => {
    if (animate && clamped === 100 && prefersReducedMotion()) onFilled?.()
  }, [animate, clamped, onFilled])

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width]",
          animate && "motion-reduce:transition-none",
        )}
        style={{
          width: `${isMounted ? clamped : 0}%`,
          ...(animate && {
            transitionDuration: `${PROGRESS_FILL_MS}ms`,
            transitionTimingFunction: EASE_OUT_CUBIC_CSS,
          }),
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName === "width" && clamped === 100) onFilled?.()
        }}
      />
    </div>
  )
}
