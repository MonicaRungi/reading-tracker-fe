import { useCallback, useState } from "react";

/**
 * Larghezza del contenuto di un elemento, aggiornata con ResizeObserver.
 * Ritorna un callback ref da assegnare all'elemento e la larghezza (0 finché
 * l'elemento non è montato).
 */
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0);

  const ref = useCallback((node: T | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
