import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Mostra un ImageData (es. il dorso elaborato) a un'altezza data, mantenendo le proporzioni. */
export function ImageDataCanvas({
  image,
  height,
  label,
  className,
}: {
  image: ImageData;
  height: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d")?.putImageData(image, 0, 0);
  }, [image]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className={cn("rounded-[3px]", className)}
      style={{ height, width: Math.round((image.width / image.height) * height) }}
    />
  );
}
