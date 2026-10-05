import type { ShelfBook } from "@/api/shelves";
import { generatedSpine } from "./generated";

/**
 * Ingombro di un dorso sulla mensola, noto prima di scaricare qualsiasi
 * immagine: la foto usa `spine_ratio` dal DB, il dorso generato le sue dimensioni.
 */
export function spineSize(
  item: ShelfBook["library_item"],
  height: number,
): { width: number; height: number } {
  if (item.spine_path && item.spine_ratio) {
    return { width: Math.round(height * item.spine_ratio), height };
  }
  const { width, height: spineHeight } = generatedSpine(item.book, height);
  return { width, height: spineHeight };
}
