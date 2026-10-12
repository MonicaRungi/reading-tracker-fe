import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { useElementWidth } from "@/hooks/useElementWidth";
import type { Point, Quad } from "@/lib/spine/homography";
import { CropLoupe } from "./CropLoupe";

const CORNER_KEYS = ["topLeft", "topRight", "bottomRight", "bottomLeft"] as const;
/** Passo delle frecce da tastiera, in pixel della foto. */
const KEY_STEP = 4;

/**
 * Foto con i 4 angoli del dorso trascinabili (dito, mouse o frecce).
 * Il quadrilatero è in pixel della foto; qui si converte da/verso lo schermo.
 * Trascinando, l'angolo mantiene la distanza dal punto in cui si è appoggiato
 * il dito (non salta sotto il dito) e una lente mostra il punto ingrandito.
 */
export function SpineCropper({
  image,
  imageWidth,
  imageHeight,
  quad,
  maxHeight,
  onChange,
}: {
  image: ImageBitmap;
  imageWidth: number;
  imageHeight: number;
  quad: Quad;
  maxHeight: number;
  onChange: (quad: Quad) => void;
}) {
  const { t } = useTranslation();
  const { ref: containerRef, width: containerWidth } = useElementWidth<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  // distanza fra il dito e l'angolo al momento della presa, in px della foto
  const grabOffset = useRef<Point>({ x: 0, y: 0 });

  const scale = containerWidth > 0 ? Math.min(containerWidth / imageWidth, maxHeight / imageHeight) : 0;
  const displayWidth = Math.round(imageWidth * scale);
  const displayHeight = Math.round(imageHeight * scale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayWidth === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  }, [image, displayWidth, displayHeight]);

  function clampToImage(point: Point): Point {
    return {
      x: Math.min(imageWidth, Math.max(0, point.x)),
      y: Math.min(imageHeight, Math.max(0, point.y)),
    };
  }

  function moveCorner(index: number, point: Point) {
    const next = [...quad] as Quad;
    next[index] = clampToImage(point);
    onChange(next);
  }

  function pointerToImage(event: PointerEvent<HTMLButtonElement>): Point {
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (scale === 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointer = pointerToImage(event);
    grabOffset.current = { x: quad[index].x - pointer.x, y: quad[index].y - pointer.y };
    setDragging(index);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (dragging !== index || scale === 0) return;
    const pointer = pointerToImage(event);
    moveCorner(index, { x: pointer.x + grabOffset.current.x, y: pointer.y + grabOffset.current.y });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = {
      ArrowLeft: { x: -KEY_STEP, y: 0 },
      ArrowRight: { x: KEY_STEP, y: 0 },
      ArrowUp: { x: 0, y: -KEY_STEP },
      ArrowDown: { x: 0, y: KEY_STEP },
    }[event.key];
    if (!delta) return;
    event.preventDefault();
    moveCorner(index, { x: quad[index].x + delta.x, y: quad[index].y + delta.y });
  }

  const points = quad.map((p) => `${p.x * scale},${p.y * scale}`).join(" ");

  return (
    <div ref={containerRef} className="flex w-full justify-center">
      {scale > 0 && (
        <div className="relative touch-none select-none" style={{ width: displayWidth, height: displayHeight }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 rounded-lg"
            style={{ width: displayWidth, height: displayHeight }}
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            width={displayWidth}
            height={displayHeight}
          >
            {/* fuori dal quadrilatero l'immagine si scurisce */}
            <path
              d={`M0 0H${displayWidth}V${displayHeight}H0Z M${points.replaceAll(" ", " L")}Z`}
              fillRule="evenodd"
              className="fill-black/45"
            />
            <polygon points={points} className="fill-none stroke-primary" strokeWidth={2} />
          </svg>
          {quad.map((point, index) => (
            <button
              key={CORNER_KEYS[index]}
              type="button"
              aria-label={t(`spine.crop.corners.${CORNER_KEYS[index]}`)}
              onPointerDown={(event) => handlePointerDown(event, index)}
              onPointerMove={(event) => handlePointerMove(event, index)}
              onPointerUp={() => setDragging(null)}
              onPointerCancel={() => setDragging(null)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              style={{ left: point.x * scale, top: point.y * scale }}
            >
              {/* area di tocco 44 px, pallino visibile 16 px */}
              <span className="absolute inset-[14px] rounded-full border-2 border-white bg-primary shadow-[0_1px_4px_rgb(0_0_0/40%)]" />
            </button>
          ))}
          {dragging !== null && (
            <CropLoupe
              image={image}
              quad={quad}
              activeIndex={dragging}
              scale={scale}
              displayWidth={displayWidth}
            />
          )}
        </div>
      )}
    </div>
  );
}
