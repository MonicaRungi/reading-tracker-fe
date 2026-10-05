import type { CSSProperties } from "react";
import type { SpineBook } from "@/api/shelves";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { generatedSpine } from "@/lib/spine/generated";
import { cn } from "@/lib/utils";
import { SpinePhoto } from "./SpinePhoto";

/** Corpo del titolo sulla mensola del dettaglio; scala con l'altezza di riferimento. */
const TITLE_FONT_SIZE = 11;
const MIN_TITLE_FONT_SIZE = 6;

type LyingStyle = CSSProperties & {
  "--spine-width": string;
  "--spine-height": string;
  "--spine-color": string;
};

/**
 * Libro sdraiato: lo stesso dorso di Spine girato in orizzontale (lungo quanto
 * il libro è alto, spesso quanto il dorso è largo), con il titolo in orizzontale
 * e il taglio delle pagine. `height` è l'altezza di riferimento del dorso in piedi.
 */
export function LyingSpine({
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
  onPhotoError?: () => void;
}) {
  if (spine_ratio) {
    const thickness = Math.round(height * spine_ratio);
    return (
      // la foto del dorso è verticale: si ruota di 90° dentro un riquadro orizzontale
      <div
        className={cn("relative shrink-0 overflow-hidden rounded-[1px_3px_3px_1px]", className)}
        style={{ width: height, height: thickness }}
      >
        <SpinePhoto
          url={spine_url}
          width={thickness}
          height={height}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
          onError={onPhotoError}
        />
      </div>
    );
  }

  const spine = generatedSpine(book, height);
  // il titolo deve stare nello spessore del libro, che è la larghezza del dorso
  const fontSize = Math.max(
    MIN_TITLE_FONT_SIZE,
    Math.min(Math.round((TITLE_FONT_SIZE * height) / SHELF_SPINE_HEIGHT), Math.round(spine.width * 0.45)),
  );
  const style: LyingStyle = {
    "--spine-width": `${spine.height}px`,
    "--spine-height": `${spine.width}px`,
    "--spine-color": spine.background,
    color: spine.foreground,
  };

  return (
    <div aria-hidden="true" className={cn("spine-lying", className)} style={style}>
      <span className="spine-lying-title font-serif" style={{ fontSize }}>
        {book.title}
      </span>
      <span className="spine-pages" />
    </div>
  );
}
