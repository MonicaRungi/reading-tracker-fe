import { useEffect, useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const ACTION_WIDTH = 88;
/** Oltre questa frazione della larghezza lo swipe elimina direttamente (come iOS). */
const FULL_SWIPE_RATIO = 0.5;
const DIRECTION_LOCK_PX = 8;

/**
 * Riga con eliminazione "stile iOS": trascinando verso sinistra compare
 * l'azione "Elimina" (stessi colori della variante `destructive` di Button).
 * Swipe parziale = resta aperta sul bottone, swipe lungo = elimina subito.
 * Scroll verticale nativo (touch-action: pan-y). Il bottone resta raggiungibile
 * da tastiera/screen reader e apre la riga quando ha il focus.
 */
export function SwipeToDelete({
  children,
  label,
  onDelete,
  className,
}: {
  children: ReactNode;
  label: string;
  onDelete: () => void;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const gesture = useRef<{
    startX: number;
    startY: number;
    startOffset: number;
    locked: "horizontal" | "vertical" | null;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const pastFullSwipe = useRef(false);

  const isOpen = offset < 0 && !isDragging;

  // Riga aperta: un tocco altrove la richiude.
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOffset(0);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  function remove() {
    const width = rootRef.current?.offsetWidth ?? 320;
    setIsRemoving(true);
    setOffset(-width);
    window.setTimeout(onDelete, 180);
  }

  function onPointerDown(event: React.PointerEvent) {
    if (isRemoving || event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      locked: null,
      moved: false,
    };
    pastFullSwipe.current = false;
  }

  function onPointerMove(event: React.PointerEvent) {
    const g = gesture.current;
    if (!g) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;

    if (!g.locked) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DIRECTION_LOCK_PX) return;
      g.locked = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      if (g.locked === "horizontal") {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        setIsDragging(true);
      }
    }
    if (g.locked !== "horizontal") return;

    g.moved = true;
    const width = rootRef.current?.offsetWidth ?? 320;
    const next = Math.min(0, Math.max(-width, g.startOffset + dx));
    const past = -next > width * FULL_SWIPE_RATIO;
    if (past !== pastFullSwipe.current) {
      pastFullSwipe.current = past;
      if (past) hapticFeedback(10);
    }
    setOffset(next);
  }

  function onPointerUp() {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    setIsDragging(false);
    if (!g.moved) {
      // tap su una riga aperta: la chiude senza aprire il contenuto
      if (g.startOffset < 0) {
        suppressClick.current = true;
        setOffset(0);
      }
      return;
    }
    suppressClick.current = true;
    const width = rootRef.current?.offsetWidth ?? 320;
    if (-offset > width * FULL_SWIPE_RATIO) remove();
    else if (-offset > ACTION_WIDTH / 2) setOffset(-ACTION_WIDTH);
    else setOffset(0);
  }

  return (
    <div ref={rootRef} className={cn("relative overflow-hidden", className)}>
      {/* Invisibile a riga chiusa: altrimenti l'antialiasing dei bordi del
          contenuto lascia intravedere un filo rosso. Opacità (non visibility)
          così il bottone resta raggiungibile da tastiera e apre la riga al focus. */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex justify-end bg-destructive/10 dark:bg-destructive/20",
          offset === 0 && "opacity-0",
        )}
        style={{ width: Math.max(ACTION_WIDTH, -offset) }}
      >
        <button
          type="button"
          onClick={remove}
          onFocus={() => setOffset(-ACTION_WIDTH)}
          onBlur={() => !isRemoving && setOffset(0)}
          className="flex h-full flex-col items-center justify-center gap-1 text-[12px] font-medium text-destructive outline-none focus-visible:ring-3 focus-visible:ring-destructive/20"
          style={{ width: ACTION_WIDTH }}
        >
          <Trash2 className="size-5" aria-hidden="true" />
          {label}
        </button>
      </div>

      <div
        className={cn(
          "relative touch-pan-y bg-background",
          !isDragging && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
