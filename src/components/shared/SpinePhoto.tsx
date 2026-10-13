import type { CSSProperties } from "react";
import { useImageLoad } from "@/hooks/useImageLoad";
import { cn } from "@/lib/utils";

type SpinePhotoStyle = CSSProperties & {
  "--spine-width": string;
  "--spine-height": string;
  "--spine-image"?: string;
};

/**
 * Foto del dorso come sfondo (utility `spine-photo` / `spine-photo-lying` di
 * index.css): niente <img>, che su iOS con la pressione lunga si ingrandisce o
 * si seleziona, e le stesse luci e ombre del dorso generato. Lo spazio è
 * riservato subito: segnaposto finché l'URL firmato non arriva o se
 * l'immagine non si carica; su errore chiede un URL nuovo con `onError`.
 * `width`/`height` sono quelli del riquadro: per il libro sdraiato la lunghezza
 * e lo spessore, la foto si ruota da sé.
 */
export function SpinePhoto({
  url,
  width,
  height,
  lying = false,
  className,
  onError,
}: {
  url: string | null | undefined;
  width: number;
  height: number;
  lying?: boolean;
  className?: string;
  onError?: () => void;
}) {
  const status = useImageLoad(url, onError);
  const isLoaded = Boolean(url) && status === "loaded";
  const style: SpinePhotoStyle = {
    "--spine-width": `${width}px`,
    "--spine-height": `${height}px`,
    "--spine-image": isLoaded ? `url("${url}")` : undefined,
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        lying ? "spine-photo-lying" : "spine-photo",
        !isLoaded && "animate-pulse",
        className,
      )}
      style={style}
    />
  );
}
