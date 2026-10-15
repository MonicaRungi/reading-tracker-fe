import type { ShelfTheme } from "@/api/shelves";

/** I colori di un tema della mensola, letti dalle custom property di index.css. */
export interface ExportTheme {
  back: string;
  board: string;
  boardLight: string;
  boardShadow: string;
  /** Linee fra i pannelli della parete (scura e chiara), se il tema le ha. */
  panelDark: string | null;
  panelLight: string | null;
  /** Venature: SVG inline del tema (parete a riquadri, piano stirato). */
  wallGrain: string | null;
  plankGrains: string[];
}

function svgUrls(value: string): string[] {
  return [...value.matchAll(/url\("?(data:image\/svg\+xml[^")]+)"?\)/g)].map((match) => match[1]);
}

/**
 * Legge il tema dal CSS (stessa fonte della pagina): un elemento nascosto con
 * `data-shelf-theme` riceve le variabili del tema.
 */
export function readShelfTheme(theme: ShelfTheme): ExportTheme {
  const probe = document.createElement("div");
  probe.dataset.shelfTheme = theme;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const css = getComputedStyle(probe);
  const read = (name: string) => css.getPropertyValue(name).trim();
  const wallGrain = read("--shelf-wall-grain");
  const panelColors = wallGrain.match(/rgb\([^)]*\)/g) ?? [];
  const result: ExportTheme = {
    back: read("--shelf-back") || "#282723",
    board: read("--shelf-board") || "#8a5a3b",
    boardLight: read("--shelf-board-light") || "#a97450",
    boardShadow: read("--shelf-board-shadow") || "rgb(0 0 0 / 30%)",
    panelDark: panelColors[0] ?? null,
    panelLight: panelColors[1] ?? null,
    wallGrain: svgUrls(wallGrain)[0] ?? null,
    plankGrains: svgUrls(read("--shelf-plank-grain")),
  };
  probe.remove();
  return result;
}

/** Mescola un colore #rrggbb con bianco o nero (come `color-mix(in srgb, …)`). */
export function mixColor(hex: string, toward: "white" | "black", amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const target = toward === "white" ? 255 : 0;
  const channels = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16));
  const mixed = channels.map((c) => Math.round(c + (target - c) * amount));
  return `rgb(${mixed.join(" ")})`;
}
