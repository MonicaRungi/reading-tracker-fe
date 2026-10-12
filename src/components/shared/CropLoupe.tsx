import { useEffect, useRef } from "react";
import type { Point, Quad } from "@/lib/spine/homography";

/** Diametro della lente, in px dello schermo. */
const LOUPE_SIZE = 112;
/** Ingrandimento rispetto alla foto come appare a schermo. */
const ZOOM = 3;
/** Distanza fra il punto e il bordo della lente: abbastanza da non finire sotto il dito. */
const GAP = 36;

/**
 * Lente d'ingrandimento sull'angolo che si sta trascinando: mostra la foto
 * ingrandita attorno al punto, con i lati del ritaglio e un mirino al centro,
 * sopra il dito (o di lato, se sopra non c'è spazio).
 */
export function CropLoupe({
  image,
  quad,
  activeIndex,
  scale,
  displayWidth,
}: {
  image: ImageBitmap;
  quad: Quad;
  activeIndex: number;
  /** Pixel dello schermo per pixel della foto. */
  scale: number;
  displayWidth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const point = quad[activeIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.round(LOUPE_SIZE * dpr);
    if (canvas.width !== size) {
      canvas.width = size;
      canvas.height = size;
    }
    // pixel della lente per pixel della foto
    const zoom = scale * ZOOM * dpr;
    const toLoupe = (p: Point) => ({
      x: (p.x - point.x) * zoom + size / 2,
      y: (p.y - point.y) * zoom + size / 2,
    });

    ctx.fillStyle = "#1b1714";
    ctx.fillRect(0, 0, size, size);
    const half = size / 2 / zoom;
    ctx.drawImage(image, point.x - half, point.y - half, half * 2, half * 2, 0, 0, size, size);

    // lati del ritaglio
    ctx.beginPath();
    quad.forEach((p, i) => {
      const { x, y } = toLoupe(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.lineWidth = 2 * dpr;
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.stroke();

    // mirino: il punto esatto dell'angolo
    const c = size / 2;
    const arm = 9 * dpr;
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = "white";
    ctx.shadowColor = "rgb(0 0 0 / 60%)";
    ctx.shadowBlur = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(c - arm, c);
    ctx.lineTo(c + arm, c);
    ctx.moveTo(c, c - arm);
    ctx.lineTo(c, c + arm);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [image, quad, point, scale]);

  const x = point.x * scale;
  const y = point.y * scale;
  const hasRoomAbove = y >= LOUPE_SIZE + GAP;
  // sopra il dito; vicino al bordo alto, di lato (dalla parte con più spazio)
  const left = hasRoomAbove
    ? Math.min(Math.max(x - LOUPE_SIZE / 2, 0), displayWidth - LOUPE_SIZE)
    : x > displayWidth / 2
      ? x - GAP - LOUPE_SIZE
      : x + GAP;
  const top = hasRoomAbove ? y - GAP - LOUPE_SIZE : Math.max(y - LOUPE_SIZE / 2, 0);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-10 rounded-full border-2 border-white text-primary shadow-[0_6px_20px_rgb(0_0_0/35%)]"
      style={{ left, top, width: LOUPE_SIZE, height: LOUPE_SIZE }}
    />
  );
}
