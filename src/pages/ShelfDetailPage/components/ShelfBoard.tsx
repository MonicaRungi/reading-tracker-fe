import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  Announcements,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { SortingStrategy } from "@dnd-kit/sortable";
import type { ShelfBook, ShelfEntry, ShelfTheme } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { useElementWidth } from "@/hooks/useElementWidth";
import {
  layoutShelfRows,
  SHELF_SPINE_GAP,
  SHELF_SPINE_HEIGHT,
  SHELF_STACK_MAX_HEIGHT,
  shelfRowInset,
} from "@/lib/shelfLayout";
import { decorByKey } from "@/lib/decor";
import { buildShelfUnits } from "@/lib/shelfUnits";
import { cn } from "@/lib/utils";
import { DraggedItem } from "./DraggedItem";
import { RemoveDropZone } from "./RemoveDropZone";
import { DisplayDrawer } from "./DisplayDrawer";
import { ReorderHint } from "./ReorderHint";
import { ShelfRow } from "./ShelfRow";

// L'ordine cambia dal vivo e il layout a flusso ricompone le righe: le
// trasformazioni di dnd-kit (che stirerebbero dorsi di larghezza diversa) non servono.
const noTransformStrategy: SortingStrategy = () => null;

// I rettangoli dei dorsi cambiano a ogni riflusso: vanno rimisurati sempre.
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };

// Invio apre il libro (vedi SortableBook): da tastiera lo spostamento parte solo con Spazio.
const KEYBOARD_CODES = { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] };

/**
 * Mensola a flusso: i dorsi riempiono una riga finché c'è spazio, poi si
 * passa alla mensola successiva. La larghezza disponibile è misurata sul
 * mobile, quindi il layout si adatta a rotazione e resize.
 * Con la pressione lunga i dorsi si trascinano (anche fra righe diverse);
 * durante il trascinamento compaiono in fondo la zona "rimuovi" e, per i
 * libri, a destra la linguetta del cassetto delle posizioni. Le decorazioni
 * stanno sulla mensola come i libri.
 */
export function ShelfBoard({
  theme,
  items,
  activeItem,
  isDrawerOpen,
  spineUrls,
  onPhotoError,
  showHint,
  onOpenBook,
  onOpenMenu,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  className,
}: {
  theme: ShelfTheme;
  items: ShelfEntry[];
  activeItem: ShelfEntry | null;
  isDrawerOpen: boolean;
  spineUrls: SpineUrls;
  onPhotoError: () => void;
  showHint: boolean;
  onOpenBook: (libraryItemId: string) => void;
  onOpenMenu: (book: ShelfBook) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragMove: (event: DragMoveEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  // contentRect esclude il padding della parete: resta da togliere quello delle righe
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // pressione prolungata: uno scorrimento normale fa scorrere le mensole
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: KEYBOARD_CODES,
    }),
  );

  // gli elementi diventano blocchi (in piedi, copertine, pile, decorazioni), poi righe a flusso
  const rows = useMemo(() => {
    const available = width - 2 * shelfRowInset();
    if (available <= 0) return [];
    const units = buildShelfUnits(items, SHELF_SPINE_HEIGHT, SHELF_STACK_MAX_HEIGHT);
    return layoutShelfRows(units, (unit) => unit.width, available, SHELF_SPINE_GAP);
  }, [items, width]);

  const itemIds = useMemo(() => items.map((item) => item.shelf_item_id), [items]);

  const announcements = useMemo<Announcements>(() => {
    const titleOf = (id: UniqueIdentifier | undefined) => {
      const item = items.find((entry) => entry.shelf_item_id === id);
      if (!item) return "";
      if (item.item_type === "book") return item.library_item.book.title;
      const decor = decorByKey(item.decor_key);
      return decor ? t(`shelves.decor.items.${decor.key}`) : "";
    };
    const positionOf = (id: UniqueIdentifier | undefined) => itemIds.indexOf(String(id)) + 1;
    return {
      onDragStart: ({ active }) => t("shelves.reorder.a11y.picked", { title: titleOf(active.id) }),
      onDragOver: ({ active, over }) =>
        over
          ? t("shelves.reorder.a11y.moved", {
              title: titleOf(active.id),
              position: positionOf(over.id),
            })
          : undefined,
      onDragEnd: ({ active }) => t("shelves.reorder.a11y.dropped", { title: titleOf(active.id) }),
      onDragCancel: ({ active }) =>
        t("shelves.reorder.a11y.cancelled", { title: titleOf(active.id) }),
    };
  }, [items, itemIds, t]);

  // la cornice resta ferma; dentro scorre la parete con le mensole
  return (
    <div data-shelf-theme={theme} className={cn("shelf-frame", className)}>
      <DndContext
        sensors={sensors}
        // solo con il puntatore sopra un dorso: negli spazi fra le righe e
        // sopra i piani non si sposta nulla
        collisionDetection={pointerWithin}
        measuring={MEASURING}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: t("shelves.reorder.a11y.instructions") },
        }}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableContext items={itemIds} strategy={noTransformStrategy}>
          <div
            ref={ref}
            // scroll proprio: il pull-to-refresh parte solo se è in cima
            data-scroll-area=""
            className="shelf-board shelf-wall min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            {rows.map((row, index) => (
              // le righe sono posizioni: durante il riflusso il primo libro di
              // una riga cambia, e una key per libro rimonterebbe la riga
              <ShelfRow
                key={index}
                units={row}
                // tutte tranne l'ultima: il blocco successivo non c'entrava
                isFull={index < rows.length - 1}
                spineUrls={spineUrls}
                onPhotoError={onPhotoError}
                onOpenBook={onOpenBook}
                onOpenMenu={onOpenMenu}
              />
            ))}
            {showHint && rows.length > 0 && <ReorderHint />}
          </div>
        </SortableContext>

        {activeItem && <RemoveDropZone />}
        {activeItem?.item_type === "book" && (
          <DisplayDrawer isOpen={isDrawerOpen} currentDisplay={activeItem.display} />
        )}

        <DragOverlay dropAnimation={null}>
          {activeItem && <DraggedItem item={activeItem} spineUrls={spineUrls} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
