import type { ShelfItemDisplay } from "@/api/shelves";

/** Tre libri in miniatura nei toni del brand, come nel menu del design. */
const BOOK_COLORS = ["#b5543c", "#8c3b2e", "#c9785c"] as const;

/** Miniatura della posizione: tre dorsi in piedi, una pila, una copertina di fronte. */
export function DisplayIcon({ display }: { display: ShelfItemDisplay }) {
  return (
    <span aria-hidden="true" className="flex size-9 shrink-0 items-end justify-center gap-[2px]">
      {display === "spine" &&
        [26, 32, 28].map((height, i) => (
          <span
            key={height}
            className="w-[7px] rounded-[1px] shadow-[inset_-1px_0_rgb(0_0_0/20%)]"
            style={{ height, backgroundColor: BOOK_COLORS[i] }}
          />
        ))}
      {display === "stack" && (
        <span className="flex flex-col-reverse items-center gap-[1px] pb-0.5">
          {[30, 34, 28].map((width, i) => (
            <span
              key={width}
              className="h-[7px] rounded-[1px] shadow-[inset_0_-1px_rgb(0_0_0/20%)]"
              style={{ width, backgroundColor: BOOK_COLORS[i] }}
            />
          ))}
        </span>
      )}
      {display === "cover" && (
        <span
          className="relative h-8 w-[22px] rounded-[1px_3px_3px_1px] shadow-[0_1px_2px_rgb(0_0_0/25%)]"
          style={{ backgroundColor: BOOK_COLORS[1] }}
        >
          <span className="absolute inset-y-0 left-0 w-[3px] bg-black/25" />
          <span className="absolute inset-x-[5px] top-[7px] h-[3px] rounded-full bg-white/50" />
        </span>
      )}
    </span>
  );
}
