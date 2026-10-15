import type { ShelfBook } from "@/api/shelves";
import type { DecorDefinition } from "@/lib/decor";
import { decorSize } from "@/lib/decor";
import { formatAuthors } from "@/lib/format";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { generatedSpine } from "@/lib/spine/generated";

/**
 * Disegno su canvas dei pezzi della mensola, ricalcando i componenti della
 * pagina (Spine, LyingSpine, BookCoverFace, DecorFace) e le utility di
 * index.css (`spine`, `spine-lying`, `spine-pages`). Coordinate in px CSS.
 */

const SERIF = "ui-serif, Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, system-ui, sans-serif";
const TITLE_FONT_SIZE = 11;
const MIN_TITLE_FONT_SIZE = 6;
const COVER_RATIO = 2 / 3;

type Ctx = CanvasRenderingContext2D;
type Radii = [number, number, number, number];

/** Rettangolo con raggi diversi per angolo (alto-sx, alto-dx, basso-dx, basso-sx). */
export function roundedRect(ctx: Ctx, x: number, y: number, w: number, h: number, [tl, tr, br, bl]: Radii) {
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

/** Il testo che sta in `maxWidth`, troncato con "…" se serve. */
function fitText(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) end--;
  return end > 0 ? `${text.slice(0, end).trimEnd()}…` : "";
}

/** Righe di testo a capo entro `maxWidth`, al massimo `maxLines` (l'ultima con "…"). */
function wrapText(ctx: Ctx, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    const used = lines.join(" ").length;
    if (used < text.length) lines[maxLines - 1] = fitText(ctx, `${lines[maxLines - 1]}…`, maxWidth);
  }
  return lines.map((l) => fitText(ctx, l, maxWidth));
}

/** Immagine che riempie il riquadro tagliando l'eccesso (come `object-fit: cover`). */
function drawCover(ctx: Ctx, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

function withShadow(ctx: Ctx, blur: number, offsetY: number, color: string, draw: () => void) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = offsetY;
  draw();
  ctx.restore();
}

/** Volume del dorso: luce a sinistra, ombra a destra (utility `spine`). */
function spineShading(ctx: Ctx, x: number, w: number) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "rgb(255 255 255 / 10%)");
  g.addColorStop(0.18, "rgb(255 255 255 / 0%)");
  g.addColorStop(0.8, "rgb(0 0 0 / 0%)");
  g.addColorStop(1, "rgb(0 0 0 / 14%)");
  return g;
}

/** Libro in piedi con il piede del dorso su `bottom`; ritorna la larghezza usata. */
export function drawStandingBook(ctx: Ctx, book: ShelfBook, x: number, bottom: number, photo: HTMLImageElement | null) {
  const { library_item } = book;
  const generated = generatedSpine(library_item.book, SHELF_SPINE_HEIGHT);
  const isPhoto = Boolean(library_item.spine_path && library_item.spine_ratio);
  const w = isPhoto ? Math.round(SHELF_SPINE_HEIGHT * Number(library_item.spine_ratio)) : generated.width;
  const h = isPhoto ? SHELF_SPINE_HEIGHT : generated.height;
  const radii: Radii = [3, 3, 1, 1];

  ctx.save();
  if (!isPhoto && generated.rotation) {
    // inclinazione con perno sul fondo del dorso, come transform-origin: bottom center
    ctx.translate(x + w / 2, bottom);
    ctx.rotate((generated.rotation * Math.PI) / 180);
    ctx.translate(-(x + w / 2), -bottom);
  }
  const top = bottom - h;
  withShadow(ctx, 3, 2, "rgb(0 0 0 / 16%)", () => {
    roundedRect(ctx, x, top, w, h, radii);
    ctx.fillStyle = generated.background;
    ctx.fill();
  });
  roundedRect(ctx, x, top, w, h, radii);
  ctx.save();
  ctx.clip();
  if (isPhoto && photo) {
    drawCover(ctx, photo, x, top, w, h);
  } else {
    // titolo in verticale, dall'alto verso il basso (writing-mode: vertical-rl)
    ctx.translate(x + w / 2, top + h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.font = `600 ${TITLE_FONT_SIZE}px ${SERIF}`;
    ctx.fillStyle = generated.foreground;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fitText(ctx, library_item.book.title, h - 18), 0, 0);
  }
  ctx.restore();
  roundedRect(ctx, x, top, w, h, radii);
  ctx.fillStyle = spineShading(ctx, x, w);
  ctx.fill();
  ctx.restore();
  return w;
}

/** Libro sdraiato in una pila, centrato in `cx`, appoggiato su `bottom`; ritorna lo spessore. */
export function drawLyingBook(ctx: Ctx, book: ShelfBook, cx: number, bottom: number, photo: HTMLImageElement | null) {
  const { library_item } = book;
  const generated = generatedSpine(library_item.book, SHELF_SPINE_HEIGHT);
  const isPhoto = Boolean(library_item.spine_path && library_item.spine_ratio);
  const length = isPhoto ? SHELF_SPINE_HEIGHT : generated.height;
  const thickness = isPhoto ? Math.round(SHELF_SPINE_HEIGHT * Number(library_item.spine_ratio)) : generated.width;
  const x = cx - length / 2;
  const top = bottom - thickness;
  const radii: Radii = [1, 3, 3, 1];

  withShadow(ctx, 3, 2, "rgb(0 0 0 / 16%)", () => {
    roundedRect(ctx, x, top, length, thickness, radii);
    ctx.fillStyle = generated.background;
    ctx.fill();
  });
  ctx.save();
  roundedRect(ctx, x, top, length, thickness, radii);
  ctx.clip();
  if (isPhoto && photo) {
    // la foto è verticale: ruotata di -90° dentro il riquadro orizzontale
    ctx.translate(cx, top + thickness / 2);
    ctx.rotate(-Math.PI / 2);
    drawCover(ctx, photo, -thickness / 2, -length / 2, thickness, length);
  } else {
    const fontSize = Math.max(
      MIN_TITLE_FONT_SIZE,
      Math.min(TITLE_FONT_SIZE, Math.round(thickness * 0.45)),
    );
    ctx.font = `600 ${fontSize}px ${SERIF}`;
    ctx.fillStyle = generated.foreground;
    ctx.textBaseline = "middle";
    ctx.fillText(fitText(ctx, library_item.book.title, length - 20), x + 8, top + thickness / 2 + 0.5);
    // taglio delle pagine a destra (utility `spine-pages`)
    const pagesX = x + length - 3;
    const pages = ctx.createLinearGradient(0, top, 0, top + thickness);
    pages.addColorStop(0, "#d8ccb4");
    pages.addColorStop(0.5, "#ece2cd");
    pages.addColorStop(1, "#d3c6ad");
    ctx.fillStyle = pages;
    ctx.fillRect(pagesX, top + 2, 3, thickness - 4);
    const inner = ctx.createLinearGradient(pagesX, 0, pagesX + 3, 0);
    inner.addColorStop(0, "rgb(0 0 0 / 28%)");
    inner.addColorStop(0.7, "rgb(0 0 0 / 0%)");
    ctx.fillStyle = inner;
    ctx.fillRect(pagesX, top + 2, 3, thickness - 4);
  }
  ctx.restore();
  // luce dall'alto (utility `spine-lying`)
  const shade = ctx.createLinearGradient(0, top, 0, top + thickness);
  shade.addColorStop(0, "rgb(255 255 255 / 12%)");
  shade.addColorStop(0.25, "rgb(255 255 255 / 0%)");
  shade.addColorStop(0.75, "rgb(0 0 0 / 0%)");
  shade.addColorStop(1, "rgb(0 0 0 / 16%)");
  roundedRect(ctx, x, top, length, thickness, radii);
  ctx.fillStyle = shade;
  ctx.fill();
  return thickness;
}

/** Libro di fronte (copertina) appoggiato su `bottom`. */
export function drawCoverBook(ctx: Ctx, book: ShelfBook, x: number, bottom: number, cover: HTMLImageElement | null) {
  const h = SHELF_SPINE_HEIGHT;
  const w = Math.round(h * COVER_RATIO);
  const top = bottom - h;
  const radii: Radii = [1, 4, 4, 1];
  const { book: info } = book.library_item;
  const generated = generatedSpine(info, h);

  withShadow(ctx, 6, 3, "rgb(0 0 0 / 28%)", () => {
    roundedRect(ctx, x, top, w, h, radii);
    ctx.fillStyle = generated.background;
    ctx.fill();
  });
  ctx.save();
  roundedRect(ctx, x, top, w, h, radii);
  ctx.clip();
  if (cover) {
    drawCover(ctx, cover, x, top, w, h);
  } else {
    // copertina generata: cornice sottile, titolo e autori centrati
    ctx.strokeStyle = generated.foreground;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w * 0.06, top + h * 0.06, w * 0.88, h * 0.88);
    ctx.globalAlpha = 1;
    ctx.fillStyle = generated.foreground;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 12px ${SERIF}`;
    const titleLines = wrapText(ctx, info.title, w * 0.8, 4);
    const authors = info.authors?.length ? formatAuthors(info.authors) : "";
    ctx.font = `8px ${SANS}`;
    const authorLines = authors ? wrapText(ctx, authors, w * 0.8, 2) : [];
    const blockH = titleLines.length * 14 + (authorLines.length ? 8 + authorLines.length * 10 : 0);
    let y = top + h / 2 - blockH / 2 + 7;
    ctx.font = `600 12px ${SERIF}`;
    for (const line of titleLines) {
      ctx.fillText(line, x + w / 2, y);
      y += 14;
    }
    ctx.font = `8px ${SANS}`;
    ctx.globalAlpha = 0.75;
    y += 3;
    for (const line of authorLines) {
      ctx.fillText(line, x + w / 2, y);
      y += 10;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "start";
  }
  // ombra della rilegatura sul lato sinistro
  const binding = ctx.createLinearGradient(x, 0, x + w * 0.06, 0);
  binding.addColorStop(0, "rgb(0 0 0 / 25%)");
  binding.addColorStop(1, "rgb(0 0 0 / 0%)");
  ctx.fillStyle = binding;
  ctx.fillRect(x, top, w * 0.06, h);
  ctx.restore();
  return w;
}

/** Decorazione appoggiata su `bottom` (la parte sotto la base scende oltre, le appese salgono). */
export function drawDecor(
  ctx: Ctx,
  decor: DecorDefinition,
  image: HTMLImageElement | null,
  x: number,
  bottom: number,
  rowHeight: number,
) {
  const size = decorSize(decor, SHELF_SPINE_HEIGHT, rowHeight);
  if (!image) return size.width;
  withShadow(ctx, 2, 2, "rgb(0 0 0 / 22%)", () => {
    ctx.drawImage(image, x, bottom + size.overhang - size.height, size.width, size.height);
  });
  return size.width;
}
