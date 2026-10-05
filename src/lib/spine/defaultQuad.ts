import type { Quad } from "./homography";

/** Rettangolo iniziale dell'editor: verticale e centrato, 20% × 80% della foto. */
export function defaultSpineQuad(width: number, height: number): Quad {
  const w = width * 0.2;
  const h = height * 0.8;
  const left = (width - w) / 2;
  const top = (height - h) / 2;
  return [
    { x: left, y: top },
    { x: left + w, y: top },
    { x: left + w, y: top + h },
    { x: left, y: top + h },
  ];
}
