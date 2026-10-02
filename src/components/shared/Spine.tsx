import type { CSSProperties } from "react";
import type { SpineBook } from "@/api/shelves";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { generatedSpine } from "@/lib/spine/generated";
import { cn } from "@/lib/utils";

/** Corpo del titolo sulla mensola del dettaglio; scala con l'altezza della costola. */
const TITLE_FONT_SIZE = 11;
const MIN_TITLE_FONT_SIZE = 6;

type SpineStyle = CSSProperties & {
  "--spine-width": string;
  "--spine-height": string;
  "--spine-color": string;
};

/**
 * Costola di un libro: la foto se c'è (Fase 3), altrimenti quella generata.
 * Le dimensioni arrivano da `spine_ratio` / `generatedSpine`, quindi lo
 * spazio è riservato prima che un'eventuale immagine sia scaricata.
 * L'aspetto (volume, ombre) sta nelle utility `spine` / `spine-title` di index.css.
 */
export function Spine({
  book,
  spine_url,
  spine_ratio,
  height,
  className,
}: {
  book: SpineBook;
  spine_url?: string | null;
  spine_ratio?: number | null;
  height: number;
  className?: string;
}) {
  if (spine_url && spine_ratio) {
    return (
      <img
        src={spine_url}
        alt=""
        className={cn(
          "shrink-0 rounded-[3px_3px_1px_1px] object-cover shadow-[0_2px_3px_rgb(0_0_0/16%)]",
          className,
        )}
        style={{ width: Math.round(height * spine_ratio), height }}
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
