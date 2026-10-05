import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Foto del dorso con lo spazio già riservato: segnaposto finché l'URL
 * firmato non arriva o se l'immagine non si carica (mai l'icona "immagine
 * rotta"). Su errore chiede un URL nuovo con `onError`.
 */
export function SpinePhoto({
  url,
  width,
  height,
  className,
  onError,
}: {
  url: string | null | undefined;
  width: number;
  height: number;
  className?: string;
  onError?: () => void;
}) {
  // l'errore vale per l'URL che l'ha prodotto: uno nuovo si riprova
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const size = { width, height };

  if (!url || failedUrl === url) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "shrink-0 animate-pulse rounded-[3px_3px_1px_1px] bg-[rgb(128_128_128/25%)]",
          className,
        )}
        style={size}
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailedUrl(url);
        onError?.();
      }}
      className={cn(
        "shrink-0 rounded-[3px_3px_1px_1px] object-cover shadow-[0_2px_3px_rgb(0_0_0/16%)]",
        className,
      )}
      style={size}
    />
  );
}
