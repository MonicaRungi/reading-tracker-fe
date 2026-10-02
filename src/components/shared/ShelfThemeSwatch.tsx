import type { ShelfTheme } from "@/api/shelves";

/** Altezze delle tre costoline del campione, in % della parete. */
const SWATCH_SPINES = [
  { height: "70%", color: "#8c3b2e" },
  { height: "82%", color: "#c98b3a" },
  { height: "64%", color: "#2f4858" },
];

/** Campione di un tema: parete, tre costoline e il piano della mensola. */
export function ShelfThemeSwatch({ theme }: { theme: ShelfTheme }) {
  return (
    <div
      data-shelf-theme={theme}
      aria-hidden="true"
      className="flex h-12 w-full flex-col overflow-hidden rounded-lg bg-(--shelf-bg) p-1"
    >
      <div className="flex flex-1 items-end justify-center gap-0.5 rounded-t-sm bg-(--shelf-back) px-1">
        {SWATCH_SPINES.map((spine) => (
          <span
            key={spine.color}
            className="w-1.5 rounded-t-[1px]"
            style={{ height: spine.height, backgroundColor: spine.color }}
          />
        ))}
      </div>
      <div className="h-1.5 border-b border-(--shelf-board-edge) bg-(--shelf-board)" />
    </div>
  );
}
