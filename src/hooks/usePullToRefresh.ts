import { useEffect, useRef, useState } from "react";
import { hapticFeedback } from "@/lib/haptics";
import { isStandalonePwa } from "@/lib/pwa";

/** Trascinamento (px, già con resistenza) oltre il quale si aggiorna. */
export const PULL_THRESHOLD = 70;
const MAX_PULL = 110;
const RESISTANCE = 0.5;
/** Evita uno spinner che lampeggia se il refetch è istantaneo. */
const MIN_REFRESH_MS = 600;
/** Movimento minimo prima di decidere se il gesto è verticale od orizzontale. */
const DIRECTION_LOCK_PX = 10;

/**
 * Pull-to-refresh sulla pagina (scroll della window). Parte solo con la pagina
 * in cima, un dito e un gesto verticale; si ignora se è aperto un dialog o un
 * bottom sheet, o se il tocco parte da un elemento `[data-no-pull-refresh]`.
 * Attivo **solo nella PWA installata**, dove il browser non offre il suo: in una
 * scheda del browser restano il pull-to-refresh e il rimbalzo nativi.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const [pull, setPull] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  useEffect(() => {
    if (!isStandalonePwa()) return;

    let start: { x: number; y: number } | null = null;
    let isPulling = false;
    let current = 0;
    let refreshing = false;

    const update = (value: number) => {
      current = value;
      setPull(value);
    };

    function onTouchStart(event: TouchEvent) {
      start = null;
      isPulling = false;
      if (refreshing || event.touches.length !== 1 || window.scrollY > 0) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[role="dialog"], [role="alertdialog"], [data-no-pull-refresh]')) {
        return;
      }
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    function onTouchMove(event: TouchEvent) {
      if (!start) return;
      const dx = event.touches[0].clientX - start.x;
      const dy = event.touches[0].clientY - start.y;

      if (!isPulling) {
        const moved = Math.max(Math.abs(dx), Math.abs(dy));
        if (moved < DIRECTION_LOCK_PX) return;
        // orizzontale (es. carosello) o verso l'alto: non è un pull-to-refresh
        if (Math.abs(dx) > Math.abs(dy) || dy < 0) {
          start = null;
          return;
        }
        isPulling = true;
      }

      if (window.scrollY > 0) {
        start = null;
        update(0);
        return;
      }

      const next = Math.min(MAX_PULL, Math.max(0, dy * RESISTANCE));
      if (current < PULL_THRESHOLD && next >= PULL_THRESHOLD) hapticFeedback(10);
      update(next);
    }

    async function onTouchEnd() {
      if (!start) return;
      start = null;
      if (!isPulling || current < PULL_THRESHOLD) {
        update(0);
        return;
      }

      refreshing = true;
      setIsRefreshing(true);
      update(PULL_THRESHOLD);
      try {
        await Promise.all([
          onRefreshRef.current(),
          new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_MS)),
        ]);
      } finally {
        refreshing = false;
        setIsRefreshing(false);
        update(0);
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return {
    pull,
    isRefreshing,
    progress: Math.min(1, pull / PULL_THRESHOLD),
  };
}
