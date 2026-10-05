import type { ShelfBook, ShelfTheme } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { Spine } from "@/components/shared/Spine";

const PREVIEW_SPINE_HEIGHT = 76;

/** Mini-mensola dell'elenco: una sola riga, i libri in eccesso si tagliano. */
export function ShelfPreview({
  theme,
  books,
  spineUrls,
  onPhotoError,
}: {
  theme: ShelfTheme;
  books: ShelfBook[];
  spineUrls: SpineUrls;
  onPhotoError: () => void;
}) {
  return (
    // cornice sottile: angoli superiori come quelli della card, squadrata in
    // basso dove tocca il corpo della card
    <div
      data-shelf-theme={theme}
      className="shelf-frame [--shelf-frame-radius-bottom:0px] [--shelf-frame-radius:10px] [--shelf-frame-width:4px]"
    >
      <div className="shelf-wall px-3 pb-3 pt-3">
        <div className="flex h-[84px] items-end justify-center-safe gap-[2px] overflow-hidden px-1.5">
          {books.map(({ shelf_item_id, library_item }) => (
            <Spine
              key={shelf_item_id}
              book={library_item.book}
              spine_url={library_item.spine_path ? spineUrls[library_item.spine_path] : undefined}
              spine_ratio={library_item.spine_ratio}
              height={PREVIEW_SPINE_HEIGHT}
              onPhotoError={onPhotoError}
            />
          ))}
        </div>
        <div className="shelf-plank [--plank-height:8px]" />
      </div>
    </div>
  );
}
