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
import type { ShelfBook, ShelfTheme } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { useElementWidth } from "@/hooks/useElementWidth";
import {
  layoutShelfRows,
  SHELF_SPINE_GAP,
  SHELF_SPINE_HEIGHT,
  shelfRowInset,
} from "@/lib/shelfLayout";
import { spineSize } from "@/lib/spine/size";
import { cn } from "@/lib/utils";
import { DraggedSpine } from "./DraggedSpine";
import { RemoveDropZone } from "./RemoveDropZone";
import { ReorderHint } from "./ReorderHint";
import { ShelfRow } from "./ShelfRow";

// L'ordine cambia dal vivo e il layout a flusso ricompone le righe: le
// trasformazioni di dnd-kit (che stirerebbero costole di larghezza diversa) non servono.
const noTransformStrategy: SortingStrategy = () => null;

// I rettangoli delle costole cambiano a ogni riflusso: vanno rimisurati sempre.
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };

// Invio apre il libro (vedi SortableSpine): da tastiera lo spostamento parte solo con Spazio.
const KEYBOARD_CODES = { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] };

/**
 * Mensola a flusso: le costole riempiono una riga finché c'è spazio, poi si
 * passa alla mensola successiva. La larghezza disponibile è misurata sul
 * mobile, quindi il layout si adatta a rotazione e resize.
 * Con la pressione lunga le costole si trascinano (anche fra righe diverse);
 * durante il trascinamento compare in fondo la zona "rimuovi".
 */
export function ShelfBoard({
  theme,
  books,
  activeBook,
  spineUrls,
  onPhotoError,
  showHint,
  onOpenBook,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  className,
}: {
  theme: ShelfTheme;
  books: ShelfBook[];
  activeBook: ShelfBook | null;
  spineUrls: SpineUrls;
  onPhotoError: () => void;
  showHint: boolean;
  onOpenBook: (libraryItemId: string) => void;
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

  const rows = useMemo(() => {
    const available = width - 2 * shelfRowInset();
    if (available <= 0) return [];
    return layoutShelfRows(
      books,
      (book) => spineSize(book.library_item, SHELF_SPINE_HEIGHT).width,
      available,
      SHELF_SPINE_GAP,
    );
  }, [books, width]);

  const itemIds = useMemo(() => books.map((book) => book.shelf_item_id), [books]);

  const announcements = useMemo<Announcements>(() => {
    const titleOf = (id: UniqueIdentifier | undefined) =>
      books.find((book) => book.shelf_item_id === id)?.library_item.book.title ?? "";
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
  }, [books, itemIds, t]);

  // la cornice resta ferma; dentro scorre la parete con le mensole
  return (
    <div data-shelf-theme={theme} className={cn("shelf-frame", className)}>
      <DndContext
        sensors={sensors}
        // solo con il puntatore sopra una costola: negli spazi fra le righe e
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
                books={row}
                spineUrls={spineUrls}
                onPhotoError={onPhotoError}
                onOpenBook={onOpenBook}
              />
            ))}
            {showHint && rows.length > 0 && <ReorderHint />}
          </div>
        </SortableContext>

        {activeBook && <RemoveDropZone />}

        <DragOverlay dropAnimation={null}>
          {activeBook && <DraggedSpine book={activeBook} spineUrls={spineUrls} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
