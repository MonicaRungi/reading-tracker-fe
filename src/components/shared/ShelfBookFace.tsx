import type { ShelfBook } from "@/api/shelves";
import { BookCoverFace } from "./BookCoverFace";
import { LyingSpine } from "./LyingSpine";
import { Spine } from "./Spine";

/** Un libro sulla mensola come sta: in piedi (dorso), sdraiato o di fronte (copertina). */
export function ShelfBookFace({
  book,
  height,
  spineUrl,
  className,
  onPhotoError,
}: {
  book: ShelfBook;
  /** Altezza di riferimento del dorso in piedi. */
  height: number;
  spineUrl?: string | null;
  className?: string;
  onPhotoError?: () => void;
}) {
  const { library_item } = book;

  if (book.display === "cover") {
    return <BookCoverFace book={library_item.book} height={height} className={className} />;
  }

  const Face = book.display === "stack" ? LyingSpine : Spine;
  return (
    <Face
      book={library_item.book}
      spine_url={spineUrl}
      spine_ratio={library_item.spine_ratio}
      height={height}
      className={className}
      onPhotoError={onPhotoError}
    />
  );
}
