import type { ShelfTheme } from "@/api/shelves";
import { Spine } from "@/components/shared/Spine";

const SWATCH_SPINE_HEIGHT = 46;

/** Libri fissi del campione: stessi colori e misure su ogni tema, per confrontarli. */
const SWATCH_BOOKS = [
  { id: "swatch-1", title: "", authors: null, page_count: 320 },
  { id: "swatch-2", title: "", authors: null, page_count: 520 },
  { id: "swatch-3", title: "", authors: null, page_count: 180 },
  { id: "swatch-4", title: "", authors: null, page_count: 410 },
  { id: "swatch-5", title: "", authors: null, page_count: 260 },
];

/** Campione di un tema: parete, qualche costola e il piano della mensola. */
export function ShelfThemeSwatch({ theme }: { theme: ShelfTheme }) {
  return (
    <div
      data-shelf-theme={theme}
      aria-hidden="true"
      className="shelf-frame w-full [--shelf-frame-radius:8px] [--shelf-frame-width:3px]"
    >
      <div className="shelf-wall overflow-hidden px-3 pb-2.5 pt-3">
        <div className="flex h-[52px] items-end justify-center gap-[2px]">
          {SWATCH_BOOKS.map((book) => (
            <Spine key={book.id} book={book} height={SWATCH_SPINE_HEIGHT} />
          ))}
        </div>
        <div className="shelf-plank [--plank-height:6px]" />
      </div>
    </div>
  );
}
