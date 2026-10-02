import type { SpineBook } from "@/api/shelves";
import { formatAuthors } from "@/lib/format";
import { generatedSpine } from "@/lib/spine/generated";
import { cn } from "@/lib/utils";

/** Sotto questa larghezza la costola mostra solo il titolo. */
const AUTHOR_MIN_WIDTH = 30;

/**
 * Costola di un libro: la foto se c'è (Fase 3), altrimenti quella generata.
 * Le dimensioni arrivano da `spine_ratio` / `generatedSpine`, quindi lo
 * spazio è riservato prima che un'eventuale immagine sia scaricata.
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
  const dropShadow =
    "drop-shadow(0 1px 2px var(--shelf-spine-shadow, rgb(0 0 0 / 0.25)))";

  if (spine_url && spine_ratio) {
    return (
      <img
        src={spine_url}
        alt=""
        className={cn("shrink-0 rounded-[2px] object-cover", className)}
        style={{ width: Math.round(height * spine_ratio), height, filter: dropShadow }}
      />
    );
  }

  const spine = generatedSpine(book, height);
  const fontSize = Math.max(8, Math.min(12, Math.round(spine.width * 0.38)));
  const showAuthor = spine.width >= AUTHOR_MIN_WIDTH && (book.authors?.length ?? 0) > 0;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 justify-center overflow-hidden rounded-[2px] py-2",
        // bordi in rilievo: separano costole vicine dello stesso tono
        "shadow-[inset_1px_0_rgb(255_255_255/0.18),inset_-1px_0_rgb(0_0_0/0.28)]",
        className,
      )}
      style={{
        width: spine.width,
        height: spine.height,
        backgroundColor: spine.background,
        color: spine.foreground,
        filter: dropShadow,
      }}
    >
      <div
        // in vertical-rl l'asse "inline" è verticale: le righe si affiancano
        // da destra a sinistra e l'ellissi tronca in altezza
        className="flex h-full min-h-0 flex-col gap-0.5 text-center leading-none [writing-mode:vertical-rl]"
        style={{ fontSize }}
      >
        <span className="truncate font-semibold">{book.title}</span>
        {showAuthor && (
          <span className="truncate opacity-75">{formatAuthors(book.authors)}</span>
        )}
      </div>
    </div>
  );
}
