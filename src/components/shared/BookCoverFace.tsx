import { useState } from "react";
import type { SpineBook } from "@/api/shelves";
import { formatAuthors } from "@/lib/format";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { generatedSpine } from "@/lib/spine/generated";
import { cn } from "@/lib/utils";

/** Proporzioni della copertina (2:3), come in bookFaceSize. */
const COVER_RATIO = 2 / 3;

/**
 * Libro di fronte: la copertina. Senza copertina (o se non si carica) una
 * copertina generata con il colore e il titolo del suo dorso.
 */
export function BookCoverFace({
  book,
  height,
  className,
}: {
  book: SpineBook;
  height: number;
  className?: string;
}) {
  // l'errore vale per l'URL che l'ha prodotto
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const width = Math.round(height * COVER_RATIO);
  const scale = height / SHELF_SPINE_HEIGHT;
  const frame = cn(
    "relative shrink-0 overflow-hidden rounded-[1px_4px_4px_1px] shadow-[0_3px_6px_rgb(0_0_0/28%)]",
    // ombra della rilegatura sul lato sinistro
    "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-[6%] after:bg-linear-to-r after:from-black/25 after:to-transparent",
    className,
  );

  if (book.cover_url && failedUrl !== book.cover_url) {
    return (
      <div aria-hidden="true" className={frame} style={{ width, height }}>
        <img
          src={book.cover_url}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailedUrl(book.cover_url)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const spine = generatedSpine(book, height);
  return (
    <div
      aria-hidden="true"
      className={cn(frame, "flex flex-col items-center justify-center gap-[6%] p-[10%] text-center")}
      style={{ width, height, backgroundColor: spine.background, color: spine.foreground }}
    >
      <span className="absolute inset-[6%] rounded-[2px] border border-current opacity-30" />
      <span
        className="line-clamp-4 font-serif font-semibold leading-tight"
        style={{ fontSize: Math.max(7, Math.round(12 * scale)) }}
      >
        {book.title}
      </span>
      {book.authors && book.authors.length > 0 && (
        <span className="line-clamp-2 opacity-75" style={{ fontSize: Math.max(5, Math.round(8 * scale)) }}>
          {formatAuthors(book.authors)}
        </span>
      )}
    </div>
  );
}
