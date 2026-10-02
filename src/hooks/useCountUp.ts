import { useEffect, useRef, useState } from "react"
import { PROGRESS_FILL_MS, easeOutCubic, prefersReducedMotion } from "@/lib/motion"

/**
 * Valore che scorre fino a `target` (da 0 al mount, poi dal valore corrente a
 * ogni cambio), con la stessa curva e durata delle barre animate.
 * Disabilitato o con "riduci movimento" restituisce subito il target.
 */
export function useCountUp(
  target: number,
  { enabled = true, duration = PROGRESS_FILL_MS } = {},
): number {
  const [value, setValue] = useState(0)
  const valueRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const from = valueRef.current
    const instant = prefersReducedMotion()
    let start: number | null = null
    let frame = requestAnimationFrame(function step(now) {
      start ??= now
      const progress = instant ? 1 : Math.min(1, (now - start) / duration)
      const next = from + (target - from) * easeOutCubic(progress)
      valueRef.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, enabled, duration])

  return enabled ? value : target
}
