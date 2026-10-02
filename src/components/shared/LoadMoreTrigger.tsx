import { useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

/**
 * Sentinella per lo scroll infinito: chiama `onLoadMore` quando entra nel
 * viewport (con un margine, così la pagina successiva arriva prima del fondo).
 */
export function LoadMoreTrigger({
  onLoadMore,
  isLoading,
}: {
  onLoadMore: () => void;
  isLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Ricreato a ogni fine caricamento: se la sentinella è ancora visibile
  // (pagina corta), l'observer riparte e chiede subito la pagina successiva.
  useEffect(() => {
    const node = ref.current;
    if (!node || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <div ref={ref} className="flex justify-center py-6">
      {isLoading && <LoadingSpinner />}
    </div>
  );
}
