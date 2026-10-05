import type { CSSProperties } from "react";
import type { SpineBook } from "@/api/shelves";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { generatedSpine } from "@/lib/spine/generated";
import { cn } from "@/lib/utils";
import { SpinePhoto } from "./SpinePhoto";

/** Corpo del titolo sulla mensola del dettaglio; scala con l'altezza della costola. */
const TITLE_FONT_SIZE = 11;
const MIN_TITLE_FONT_SIZE = 6;

type SpineStyle = CSSProperties & {
  "--spine-width": string;
  "--spine-height": string;
  "--spine-color": string;
};

/**
 * Costola di un libro: la foto se c'è, altrimenti quella generata.
 * `spine_ratio` c'è se e solo se il libro ha una foto (vincolo nel DB): lo
 * spazio della foto è riservato subito, con un segnaposto finché l'URL firmato
 * non arriva, così la mensola non "salta" durante il caricamento.
 * L'aspetto (volume, ombre) sta nelle utility `spine` / `spine-title` di index.css.
 */
export function Spine({
  book,
  spine_url,
  spine_ratio,
  height,
  className,
  onPhotoError,
}: {
  book: SpineBook;
  spine_url?: string | null;
  spine_ratio?: number | null;
  height: number;
  className?: string;
  /** L'immagine non si carica (es. URL firmato scaduto): chi la mostra può rigenerarlo. */
  onPhotoError?: () => void;
}) {
  if (spine_ratio) {
    return (
      <SpinePhoto
        url={spine_url}
        width={Math.round(height * spine_ratio)}
        height={height}
        className={className}
        onError={onPhotoError}
      />
    );
  }

  const spine = generatedSpine(book, height);
  const fontSize = Math.max(
    MIN_TITLE_FONT_SIZE,
    Math.round((TITLE_FONT_SIZE * height) / SHELF_SPINE_HEIGHT),
  );
  const style: SpineStyle = {
    "--spine-width": `${spine.width}px`,
    "--spine-height": `${spine.height}px`,
    "--spine-color": spine.background,
    color: spine.foreground,
    transform: spine.rotation ? `rotate(${spine.rotation}deg)` : undefined,
  };

  return (
    <div aria-hidden="true" className={cn("spine", className)} style={style}>
      <span className="spine-title font-serif" style={{ fontSize }}>
        {book.title}
      </span>
    </div>
  );
}
