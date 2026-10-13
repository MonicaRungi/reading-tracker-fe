import { useEffect, useRef, useState } from "react";

export type ImageLoadStatus = "loading" | "loaded" | "error";

/**
 * Carica un'immagine fuori dal DOM e ne segue lo stato: serve a chi la mostra
 * come sfondo CSS, che non ha onLoad/onError. Lo stato vale per l'URL che l'ha
 * prodotto, quindi uno nuovo (es. URL firmato rigenerato) riparte da "loading".
 */
export function useImageLoad(url: string | null | undefined, onError?: () => void): ImageLoadStatus {
  const [result, setResult] = useState<{ url: string; status: ImageLoadStatus } | null>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!cancelled) setResult({ url, status: "loaded" });
    };
    image.onerror = () => {
      if (cancelled) return;
      setResult({ url, status: "error" });
      onErrorRef.current?.();
    };
    image.src = url;
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [url]);

  return url && result?.url === url ? result.status : "loading";
}
