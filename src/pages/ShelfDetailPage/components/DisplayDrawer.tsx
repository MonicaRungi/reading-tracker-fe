import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import type { ShelfItemDisplay } from "@/api/shelves";
import { SHELF_DISPLAY_TAB_ID, displayDropId } from "@/lib/shelfLayout";
import { cn } from "@/lib/utils";
import { DisplayDropOption } from "./DisplayDropOption";

const OPTIONS: readonly ShelfItemDisplay[] = ["spine", "stack", "cover"];
const OPTION_IDS = OPTIONS.map(displayDropId);

/**
 * Durante il trascinamento: una linguetta sul bordo destro del mobile. Portandoci
 * il libro si apre il cassetto con le tre posizioni; rilasciandolo su una di
 * esse il libro cambia posizione (in piedi, sdraiato, di fronte).
 */
export function DisplayDrawer({
  isOpen,
  currentDisplay,
}: {
  isOpen: boolean;
  currentDisplay: ShelfItemDisplay;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: SHELF_DISPLAY_TAB_ID });
  const { measureDroppableContainers } = useDndContext();

  // le zone compaiono mentre il cassetto entra da destra: dnd-kit le misura lì, fuori
  // posto, e il rilascio sopra un'opzione cadrebbe nel vuoto. Si rimisurano a
  // cassetto fermo (fine transizione; il frame dopo l'apertura copre l'assenza di animazione).
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => measureDroppableContainers(OPTION_IDS));
    return () => cancelAnimationFrame(frame);
  }, [isOpen, measureDroppableContainers]);

  return (
    <>
      {/* linguetta: zona di rilascio più ampia della parte visibile, per il dito */}
      <div
        ref={setNodeRef}
        aria-hidden="true"
        className={cn(
          "absolute right-0 top-1/2 z-10 flex h-24 w-12 -translate-y-1/2 items-center justify-end transition-opacity",
          isOpen && "pointer-events-none opacity-0",
        )}
      >
        <span
          className={cn(
            "flex h-16 w-7 items-center justify-center rounded-l-2xl bg-accent text-primary shadow-[-2px_2px_8px_rgb(0_0_0/25%)] transition-transform",
            isOver && "w-9",
          )}
        >
          <ChevronLeft className="size-4" />
        </span>
      </div>

      <div
        onTransitionEnd={(event) => {
          if (isOpen && event.target === event.currentTarget) measureDroppableContainers(OPTION_IDS);
        }}
        className={cn(
          "absolute bottom-[22%] right-2 top-[10%] z-20 flex w-28 flex-col gap-1.5 rounded-2xl bg-popover/95 p-2 shadow-[0_10px_30px_rgb(0_0_0/30%)] backdrop-blur-sm transition-[translate,opacity] duration-200",
          isOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[120%] opacity-0",
        )}
      >
        {/* le zone si registrano solo a cassetto aperto, così non intercettano il libro prima */}
        {isOpen &&
          OPTIONS.map((display) => (
            <DisplayDropOption key={display} display={display} isCurrent={display === currentDisplay} />
          ))}
      </div>
    </>
  );
}
