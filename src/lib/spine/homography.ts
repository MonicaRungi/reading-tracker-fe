/**
 * Raddrizzamento prospettico del dorso: dai 4 angoli scelti dall'utente a
 * un rettangolo verticale, con mappatura inversa e campionamento bilineare.
 */

export interface Point {
  x: number;
  y: number;
}

/** Angoli nell'ordine: alto-sinistra, alto-destra, basso-destra, basso-sinistra. */
export type Quad = [Point, Point, Point, Point];

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Larghezza e altezza del rettangolo raddrizzato: media dei lati opposti. */
export function quadSize([tl, tr, br, bl]: Quad): { width: number; height: number } {
  return {
    width: (distance(tl, tr) + distance(bl, br)) / 2,
    height: (distance(tl, bl) + distance(tr, br)) / 2,
  };
}

/**
 * Un dorso è sempre alto e stretto: se il quadrilatero è più largo che
 * alto (foto scattata in orizzontale) gli angoli ruotano di 90°, così il lato
 * sinistro diventa quello in alto.
 */
export function orientQuad(quad: Quad): Quad {
  const { width, height } = quadSize(quad);
  if (width <= height) return quad;
  const [tl, tr, br, bl] = quad;
  return [bl, tl, tr, br];
}

// Eliminazione di Gauss con pivot parziale su un sistema n×n.
function solveLinear(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) throw new Error("homography: angoli degeneri");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col];
      for (let k = col; k <= n; k++) a[row][k] -= factor * a[col][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = a[row][n];
    for (let k = row + 1; k < n; k++) sum -= a[row][k] * x[k];
    x[row] = sum / a[row][row];
  }
  return x;
}

/**
 * Omografia (8 coefficienti, h₈ = 1) che porta il rettangolo [0,w]×[0,h]
 * sul quadrilatero: per ogni pixel di output dice dove leggere nella sorgente.
 */
export function rectToQuadHomography(width: number, height: number, quad: Quad): number[] {
  const corners: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  const matrix: number[][] = [];
  const rhs: number[] = [];
  corners.forEach(({ x: u, y: v }, i) => {
    const { x, y } = quad[i];
    matrix.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
    rhs.push(x);
    matrix.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
    rhs.push(y);
  });
  return solveLinear(matrix, rhs);
}

/** Raddrizza il quadrilatero di `source` in un'immagine `width`×`height`. */
export function warpQuad(source: ImageData, quad: Quad, width: number, height: number): ImageData {
  const [h0, h1, h2, h3, h4, h5, h6, h7] = rectToQuadHomography(width, height, quad);
  const out = new ImageData(width, height);
  const src = source.data;
  const dst = out.data;
  const sw = source.width;
  const sh = source.height;
  const maxX = sw - 1;
  const maxY = sh - 1;

  for (let v = 0; v < height; v++) {
    const cv = v + 0.5;
    for (let u = 0; u < width; u++) {
      const cu = u + 0.5;
      const w = h6 * cu + h7 * cv + 1;
      // centro del pixel sorgente → coordinate dei vicini per il bilineare
      const x = Math.min(maxX, Math.max(0, (h0 * cu + h1 * cv + h2) / w - 0.5));
      const y = Math.min(maxY, Math.max(0, (h3 * cu + h4 * cv + h5) / w - 0.5));
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const x1 = Math.min(maxX, x0 + 1);
      const y1 = Math.min(maxY, y0 + 1);
      const fx = x - x0;
      const fy = y - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      const o = (v * width + u) * 4;
      for (let c = 0; c < 4; c++) {
        const top = src[i00 + c] + (src[i10 + c] - src[i00 + c]) * fx;
        const bottom = src[i01 + c] + (src[i11 + c] - src[i01 + c]) * fx;
        dst[o + c] = top + (bottom - top) * fy;
      }
    }
  }
  return out;
}
