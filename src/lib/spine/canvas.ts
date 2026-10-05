/**
 * Canvas utilizzabile sia nel worker (OffscreenCanvas) sia sul thread
 * principale dei browser che non lo supportano (Safari < 16.4).
 */
export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
export type AnyContext2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context2d(canvas: AnyCanvas): AnyContext2D {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas: contesto 2d non disponibile");
  return ctx as AnyContext2D;
}

export function canvasToBlob(canvas: AnyCanvas, type: string, quality: number): Promise<Blob> {
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type, quality });
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas: toBlob fallito"))),
      type,
      quality,
    ),
  );
}

export function canvasToBitmap(canvas: AnyCanvas): Promise<ImageBitmap> {
  if ("transferToImageBitmap" in canvas) return Promise.resolve(canvas.transferToImageBitmap());
  return createImageBitmap(canvas);
}
