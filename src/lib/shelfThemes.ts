import type { ShelfTheme } from "@/api/shelves";

/**
 * Temi della mensola, nell'ordine del selettore. I colori stanno in index.css
 * (`[data-shelf-theme="…"]`): qui solo le chiavi e le label i18n.
 */
export const SHELF_THEMES: readonly ShelfTheme[] = ["wood", "white", "night", "sage"];

export const DEFAULT_SHELF_THEME: ShelfTheme = "wood";

export const SHELF_THEME_LABEL_KEYS: Record<ShelfTheme, string> = {
  wood: "shelves.themes.wood",
  white: "shelves.themes.white",
  night: "shelves.themes.night",
  sage: "shelves.themes.sage",
};
