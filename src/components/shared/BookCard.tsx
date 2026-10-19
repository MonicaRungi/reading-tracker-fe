import { useState } from "react";
import type { LibraryItem } from "@/api/library";
import { formatAuthors } from "@/lib/format";
import { generatedSpine } from "@/lib/spine/generated";
import { useNavigate } from "react-router-dom";

/** Altezza di riferimento per generatedSpine: qui servono solo i colori. */
const PLACEHOLDER_HEIGHT = 100;

export function BookCard({ item }: { item: LibraryItem }) {
  const navigate = useNavigate();
  // l'errore vale per l'URL che l'ha prodotto
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const { book } = item;
  const showCover = book.cover_url && failedUrl !== book.cover_url;
  const placeholder = generatedSpine(book, PLACEHOLDER_HEIGHT);

  return (
    <div
      className="flex flex-col gap-2 cursor-pointer"
      onClick={() => navigate(`/book/${item.id}`)}
    >
      {/* Copertina verticale 2:3 */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-[#F1EFEC] shadow-card">
        {showCover ? (
          <img
            src={book.cover_url!}
            alt={book.title}
            loading="lazy"
            onError={() => setFailedUrl(book.cover_url)}
            className="h-full w-full object-cover"
          />
        ) : (
          // Senza copertina (o se non si carica): copertina generata con i
          // colori del dorso, come sugli scaffali
          <div
            aria-hidden="true"
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
            style={{ backgroundColor: placeholder.background, color: placeholder.foreground }}
          >
            <span className="line-clamp-4 font-serif text-[14px] font-semibold leading-tight">
              {book.title}
            </span>
            {book.authors && book.authors.length > 0 && (
              <span className="line-clamp-2 text-[11px] opacity-75">
                {formatAuthors(book.authors)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="line-clamp-2 text-[12px] font-medium leading-tight text-foreground">
          {book.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#938C84]">
          {formatAuthors(book.authors)}
        </p>
      </div>
    </div>
  );
}
