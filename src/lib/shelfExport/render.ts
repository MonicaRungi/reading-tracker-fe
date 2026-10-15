import type { ShelfBook, ShelfEntry, ShelfTheme } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { decorByKey } from "@/lib/decor";
import {
  layoutShelfRows,
  SHELF_ROW_GAP,
  SHELF_ROW_HEIGHT_MOBILE,
  SHELF_SPINE_GAP,
  SHELF_SPINE_HEIGHT,
  SHELF_STACK_MAX_HEIGHT,
  shelfRowHeight,
  shelfRowInset,
} from "@/lib/shelfLayout";
import type { ShelfUnit } from "@/lib/shelfUnits";
import { buildShelfUnits, STACK_GAP } from "@/lib/shelfUnits";
import { drawCoverBook, drawDecor, drawLyingBook, drawStandingBook, roundedRect } from "./draw";
import { ExportImages } from "./images";
import type { ExportTheme } from "./theme";
import { mixColor, readShelfTheme } from "./theme";

/**
 * Esportazione della mensola come immagine PNG. Si ridisegna tutto su canvas
 * con le misure della pagina sul dispositivo (larghezza delle righe misurata,
 * altezze, piani e margini di index.css): le righe vanno a capo negli stessi
 * punti che si vedono a schermo. L'immagine è larga 1080 px: cambia solo la
 * scala. Niente "foto" del DOM, che su Safari è inaffidabile.
 */

/** Larghezza dell'immagine finale, in pixel. */
const OUTPUT_WIDTH = 1080;
/** Limite di pixel di un canvas su iOS Safari. */
const MAX_PIXELS = 16_000_000;
/** Larghezza delle righe se non si può misurare la pagina (telefono da 390 px). */
const DEFAULT_ROW_WIDTH = 342;

const PAGE_PADDING = 18;
const HEADER_HEIGHT = 58;
const FOOTER_HEIGHT = 30;
const WALL_PADDING_TOP = 24;
const WALL_PADDING_BOTTOM = 32;

/** Stesso breakpoint di `shelf-books` / `shelf-board` / `shelf-frame` in index.css. */
const MOBILE_QUERY = "(width < 40rem)";

/** Misure dell'impaginazione: specchio di index.css sul dispositivo corrente. */
interface Metrics {
  width: number;
  rowWidth: number;
  rowHeight: number;
  rowInset: number;
  plankHeight: number;
  wallInline: number;
  frameWidth: number;
  frameRadius: number;
}

function metricsFor(rowWidth: number | undefined): Metrics {
  const mobile = window.matchMedia(MOBILE_QUERY).matches;
  const rowInset = shelfRowInset();
  const wallInline = mobile ? 10 : 16;
  const frameWidth = mobile ? 5 : 6;
  const width = (rowWidth ?? DEFAULT_ROW_WIDTH) + 2 * (rowInset + wallInline + frameWidth + PAGE_PADDING);
  return {
    width,
    rowWidth: rowWidth ?? DEFAULT_ROW_WIDTH,
    rowHeight: rowWidth ? shelfRowHeight() : SHELF_ROW_HEIGHT_MOBILE,
    rowInset,
    plankHeight: mobile ? 11 : 14,
    wallInline,
    frameWidth,
    frameRadius: mobile ? 18 : 20,
  };
}

const SANS = "-apple-system, system-ui, sans-serif";
/** Illustrazione dell'app (public/, quella del login) accanto alla firma: versione chiara o scura. */
const LOGO_SRC = { light: "books-hero.png", dark: "books-hero-dark.png" } as const;
const LOGO_HEIGHT = 22;

/** Colori della pagina dell'immagine: quelli dell'app nel tema attivo (chiaro o scuro). */
interface PageColors {
  isDark: boolean;
  background: string;
  text: string;
  muted: string;
}

function readPageColors(): PageColors {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const css = getComputedStyle(root);
  const read = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    isDark,
    // in chiaro il crema delle card, più caldo del bianco dello sfondo
    background: isDark ? read("--background", "#15161b") : read("--card", "#faf8f6"),
    text: read("--foreground", isDark ? "#f0ede6" : "#1b1714"),
    muted: read("--muted-foreground", isDark ? "#9a9aa2" : "#938c84"),
  };
}

export interface ShelfExportInput {
  title: string;
  subtitle: string;
  footer: string;
  theme: ShelfTheme;
  items: readonly ShelfEntry[];
  spineUrls: SpineUrls;
  /** Larghezza utile delle righe nella pagina (px CSS), per andare a capo negli stessi punti. */
  rowWidth?: number;
}

interface Loaded {
  spines: Map<string, HTMLImageElement | null>;
  covers: Map<string, HTMLImageElement | null>;
  decor: Map<string, HTMLImageElement | null>;
  wallGrain: HTMLImageElement | null;
  plankGrains: HTMLImageElement[];
  logo: HTMLImageElement | null;
}

async function loadAll(
  input: ShelfExportInput,
  theme: ExportTheme,
  colors: PageColors,
  images: ExportImages,
): Promise<Loaded> {
  const books = input.items.filter((item): item is ShelfBook => item.item_type === "book");
  const spinePaths = [...new Set(books.map((b) => b.library_item.spine_path).filter((p): p is string => Boolean(p)))];
  const coverUrls = [
    ...new Set(books.filter((b) => b.display === "cover").map((b) => b.library_item.book.cover_url).filter((u): u is string => Boolean(u))),
  ];
  const decorKeys = [
    ...new Set(input.items.flatMap((item) => (item.item_type === "decor" ? [decorByKey(item.decor_key)?.key ?? ""] : [])).filter(Boolean)),
  ];
  const pairs = <T,>(keys: string[], load: (key: string) => Promise<T>) =>
    Promise.all(keys.map(async (key) => [key, await load(key)] as const)).then((entries) => new Map(entries));

  const [spines, covers, decor, wallGrain, plankGrains, logo] = await Promise.all([
    pairs(spinePaths, (path) => (input.spineUrls[path] ? images.spine(input.spineUrls[path]) : Promise.resolve(null))),
    pairs(coverUrls, (url) => images.cover(url)),
    pairs(decorKeys, (key) => images.load(decorByKey(key)!.src)),
    theme.wallGrain ? images.load(theme.wallGrain) : Promise.resolve(null),
    Promise.all(theme.plankGrains.map((src) => images.load(src))),
    images.load(`${import.meta.env.BASE_URL}${colors.isDark ? LOGO_SRC.dark : LOGO_SRC.light}`),
  ]);
  return {
    spines,
    covers,
    decor,
    wallGrain,
    plankGrains: plankGrains.filter((g): g is HTMLImageElement => g !== null),
    logo,
  };
}

function rowHeightOf(row: ShelfUnit[], minHeight: number): number {
  // le decorazioni appese salgono nello spazio sopra e non allungano la riga
  const tallest = Math.max(0, ...row.map((unit) => (unit.kind === "decor" && decorByKey(unit.decor.decor_key)?.hanging ? 0 : unit.height)));
  return Math.max(minHeight, tallest);
}

function drawPlank(
  ctx: CanvasRenderingContext2D,
  theme: ExportTheme,
  grains: HTMLImageElement[],
  x: number,
  y: number,
  w: number,
  plankHeight: number,
) {
  // ombra portata e bordo inferiore (::after)
  ctx.save();
  ctx.shadowColor = theme.boardShadow;
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 8;
  roundedRect(ctx, x, y, w, plankHeight, [3, 3, 3, 3]);
  ctx.fillStyle = theme.board;
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = mixColor(theme.board, "black", 0.2);
  roundedRect(ctx, x + 4, y + plankHeight - 1, w - 8, 6, [0, 0, 4, 4]);
  ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + plankHeight);
  g.addColorStop(0, theme.boardLight);
  g.addColorStop(0.55, theme.board);
  g.addColorStop(1, mixColor(theme.board, "black", 0.12));
  roundedRect(ctx, x, y, w, plankHeight, [3, 3, 3, 3]);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (const grain of grains) ctx.drawImage(grain, x, y, w, plankHeight);
  ctx.fillStyle = "rgb(255 255 255 / 10%)";
  ctx.fillRect(x, y, w, 3);
  ctx.restore();
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  row: ShelfUnit[],
  loaded: Loaded,
  left: number,
  width: number,
  bottom: number,
  isFull: boolean,
  rowHeight: number,
) {
  const used = row.reduce((sum, unit) => sum + unit.width, 0) + SHELF_SPINE_GAP * Math.max(0, row.length - 1);
  // righe chiuse centrate, l'ultima allineata a sinistra (come ShelfRow)
  let x = isFull ? left + Math.max(0, (width - used) / 2) : left;
  for (const unit of row) {
    if (unit.kind === "decor") {
      const decor = decorByKey(unit.decor.decor_key);
      if (decor) drawDecor(ctx, decor, loaded.decor.get(decor.key) ?? null, x, bottom, rowHeight);
    } else if (unit.kind === "stack") {
      // pila: dal basso verso l'alto, ogni libro centrato nella larghezza della pila
      let pileBottom = bottom;
      for (const book of unit.books) {
        const photo = book.library_item.spine_path ? (loaded.spines.get(book.library_item.spine_path) ?? null) : null;
        pileBottom -= drawLyingBook(ctx, book, x + unit.width / 2, pileBottom, photo) + STACK_GAP;
      }
    } else {
      const book = unit.books[0];
      if (unit.kind === "cover") {
        const cover = book.library_item.book.cover_url ? (loaded.covers.get(book.library_item.book.cover_url) ?? null) : null;
        drawCoverBook(ctx, book, x, bottom, cover);
      } else {
        const photo = book.library_item.spine_path ? (loaded.spines.get(book.library_item.spine_path) ?? null) : null;
        drawStandingBook(ctx, book, x, bottom, photo);
      }
    }
    x += unit.width + SHELF_SPINE_GAP;
  }
}

function paint(
  canvas: HTMLCanvasElement,
  input: ShelfExportInput,
  theme: ExportTheme,
  loaded: Loaded,
  withGrain: boolean,
  metrics: Metrics,
  colors: PageColors,
) {
  const { width: WIDTH, rowWidth, rowHeight, frameWidth: FRAME_WIDTH, frameRadius: FRAME_RADIUS } = metrics;
  const PLANK_HEIGHT = metrics.plankHeight;
  const frameX = PAGE_PADDING;
  const frameW = WIDTH - 2 * PAGE_PADDING;
  const wallX = frameX + FRAME_WIDTH;
  const wallW = frameW - 2 * FRAME_WIDTH;
  const rowLeft = wallX + metrics.wallInline + metrics.rowInset;

  const units = buildShelfUnits(input.items, SHELF_SPINE_HEIGHT, SHELF_STACK_MAX_HEIGHT, rowHeight);
  const rows = layoutShelfRows(units, (unit) => unit.width, rowWidth, SHELF_SPINE_GAP);
  if (rows.length === 0) rows.push([]);
  const rowHeights = rows.map((row) => rowHeightOf(row, rowHeight));
  const wallH =
    WALL_PADDING_TOP +
    rowHeights.reduce((sum, h) => sum + h + PLANK_HEIGHT, 0) +
    SHELF_ROW_GAP * (rows.length - 1) +
    WALL_PADDING_BOTTOM;
  const frameY = PAGE_PADDING + HEADER_HEIGHT;
  const frameH = wallH + 2 * FRAME_WIDTH;
  const height = frameY + frameH + FOOTER_HEIGHT + PAGE_PADDING;

  const scale = Math.min(OUTPUT_WIDTH / WIDTH, Math.sqrt(MAX_PIXELS / (WIDTH * height)));
  canvas.width = Math.round(WIDTH * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // pagina e intestazione
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.fillStyle = colors.text;
  ctx.font = `700 22px ${SANS}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(input.title, PAGE_PADDING, PAGE_PADDING + 24, WIDTH - 2 * PAGE_PADDING);
  ctx.fillStyle = colors.muted;
  ctx.font = `400 13px ${SANS}`;
  ctx.fillText(input.subtitle, PAGE_PADDING, PAGE_PADDING + 44);

  // cornice: legno del tema con luce dall'alto
  ctx.save();
  ctx.shadowColor = theme.boardShadow;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  roundedRect(ctx, frameX, frameY, frameW, frameH, [FRAME_RADIUS, FRAME_RADIUS, FRAME_RADIUS, FRAME_RADIUS]);
  const frameGradient = ctx.createLinearGradient(frameX, frameY, frameX + frameW * 0.35, frameY + frameH);
  frameGradient.addColorStop(0, theme.boardLight);
  frameGradient.addColorStop(0.45, theme.board);
  frameGradient.addColorStop(1, mixColor(theme.board, "black", 0.18));
  ctx.fillStyle = frameGradient;
  ctx.fill();
  ctx.restore();

  // parete: fondo del tema, pannelli e venatura
  const wallY = frameY + FRAME_WIDTH;
  const innerRadius = FRAME_RADIUS - FRAME_WIDTH;
  const wallRadii: [number, number, number, number] = [innerRadius, innerRadius, innerRadius, innerRadius];
  ctx.save();
  roundedRect(ctx, wallX, wallY, wallW, wallH, wallRadii);
  ctx.clip();
  const wallGradient = ctx.createLinearGradient(0, wallY, 0, wallY + wallH);
  wallGradient.addColorStop(0, mixColor(theme.back, "white", 0.08));
  wallGradient.addColorStop(1, theme.back);
  ctx.fillStyle = wallGradient;
  ctx.fillRect(wallX, wallY, wallW, wallH);
  if (withGrain && loaded.wallGrain) {
    for (let x = wallX; x < wallX + wallW; x += 64) {
      for (let y = wallY; y < wallY + wallH; y += 480) ctx.drawImage(loaded.wallGrain, x, y, 64, 480);
    }
  }
  if (theme.panelDark) {
    for (let x = wallX + 55; x < wallX + wallW; x += 57) {
      ctx.fillStyle = theme.panelDark;
      ctx.fillRect(x, wallY, 1, wallH);
      if (theme.panelLight) {
        ctx.fillStyle = theme.panelLight;
        ctx.fillRect(x + 1, wallY, 1, wallH);
      }
    }
  }

  // righe: piano, poi libri e decorazioni (che possono scendere sul piano)
  let rowTop = wallY + WALL_PADDING_TOP;
  rows.forEach((row, index) => {
    const bottom = rowTop + rowHeights[index];
    const plankX = wallX + metrics.wallInline;
    drawPlank(ctx, theme, withGrain ? loaded.plankGrains : [], plankX, bottom, wallW - 2 * metrics.wallInline, PLANK_HEIGHT);
    drawRow(ctx, row, loaded, rowLeft, rowWidth, bottom, index < rows.length - 1, rowHeight);
    rowTop = bottom + PLANK_HEIGHT + SHELF_ROW_GAP;
  });

  // parete incassata: ombra interna lungo il bordo
  ctx.shadowColor = "rgb(0 0 0 / 28%)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgb(0 0 0 / 100%)";
  roundedRect(ctx, wallX - 6, wallY - 6, wallW + 12, wallH + 12, wallRadii.map((r) => r + 6) as typeof wallRadii);
  ctx.stroke();
  ctx.restore();

  // firma: illustrazione dell'app e nome, in basso a destra
  const footerY = frameY + frameH + 22;
  ctx.fillStyle = colors.muted;
  ctx.font = `600 12px ${SANS}`;
  ctx.textAlign = "right";
  ctx.fillText(input.footer, WIDTH - PAGE_PADDING, footerY);
  ctx.textAlign = "start";
  if (loaded.logo) {
    // proporzioni dell'immagine, poggiata sulla linea del testo
    const logoW = (LOGO_HEIGHT * loaded.logo.naturalWidth) / loaded.logo.naturalHeight;
    const logoX = WIDTH - PAGE_PADDING - ctx.measureText(input.footer).width - 5 - logoW;
    ctx.drawImage(loaded.logo, logoX, footerY - LOGO_HEIGHT + 4, logoW, LOGO_HEIGHT);
  }
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob vuoto"))), "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

/** Disegna la mensola e ritorna il PNG. Le immagini che non si caricano diventano dorsi/copertine generati. */
export async function renderShelfImage(input: ShelfExportInput): Promise<Blob> {
  const theme = readShelfTheme(input.theme);
  const images = new ExportImages();
  try {
    const colors = readPageColors();
    const loaded = await loadAll(input, theme, colors, images);
    const metrics = metricsFor(input.rowWidth);
    const canvas = document.createElement("canvas");
    paint(canvas, input, theme, loaded, true, metrics, colors);
    try {
      return await toPng(canvas);
    } catch {
      // un browser che considera "sporche" le venature SVG: si rifà senza
      paint(canvas, input, theme, loaded, false, metrics, colors);
      return await toPng(canvas);
    }
  } finally {
    images.release();
  }
}
