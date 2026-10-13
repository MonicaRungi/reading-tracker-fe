import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  addBookToShelf,
  addDecorToShelf,
  removeShelfItem,
  reorderShelf,
  setShelfItemDisplay,
} from "@/api/shelves";
import type { ShelfBook, ShelfDetail, ShelfEntry, ShelfItemDisplay } from "@/api/shelves";
import { getBooleanPreference, setBooleanPreference } from "@/lib/preferences";
import { displayFromDropId, SHELF_DISPLAY_TAB_ID, SHELF_REMOVE_ZONE_ID } from "@/lib/shelfLayout";

/** Per quanto resta disponibile "Annulla" dopo una rimozione. */
const UNDO_DURATION_MS = 5000;

/**
 * Movimento minimo del puntatore fra due spostamenti. Uno spostamento ricompone
 * le righe e può portare un altro dorso sotto il puntatore fermo: senza
 * questa soglia il riflusso si alimenterebbe da solo all'infinito.
 */
const MIN_MOVE_BETWEEN_SWAPS_PX = 8;

/** Il suggerimento "Tieni premuto e trascina" sparisce dopo il primo riordino riuscito. */
const REORDER_HINT_KEY = "rt.shelfReorderHintSeen";

/**
 * Dopo un trascinamento il browser può emettere un click sul dorso (mouse
 * rilasciato sopra di lei, pressione lunga senza movimento): va ignorato,
 * altrimenti aprirebbe il libro appena spostato.
 */
const CLICK_AFTER_DRAG_MS = 300;

/** Il libro del menu contestuale (tasto destro / tasto menu) e dove sta sullo schermo. */
export interface DisplayMenuTarget {
  book: ShelfBook;
  rect: DOMRect;
}

function sameOrder(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

function withPositions(items: ShelfEntry[]): ShelfEntry[] {
  return items.map((item, i) => ({ ...item, position: i + 1 }));
}

/**
 * Riordino del dettaglio scaffale (libri e decorazioni), senza modalità
 * dedicata: un tap apre il libro, la pressione lunga solleva l'elemento. Durante il trascinamento l'ordine vive in `draftOrder`
 * (riflusso dal vivo delle righe); al rilascio diventa ottimistico in cache e
 * parte una sola chiamata a reorder_shelf. Rilasciando sulla zona "rimuovi"
 * l'elemento esce dallo scaffale, con "Annulla".
 */
export function useShelfReorder({
  userId,
  shelfId,
  items,
}: {
  userId: string | undefined;
  shelfId: string;
  items: ShelfEntry[];
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const shelfKey = ["shelf", userId, shelfId];

  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menu, setMenu] = useState<DisplayMenuTarget | null>(null);
  // cassetto delle posizioni: si apre trascinando il libro sulla linguetta a destra
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hintSeen, setHintSeen] = useState(() => getBooleanPreference(REORDER_HINT_KEY, false));
  // posizione del puntatore (delta dall'inizio del trascinamento) all'ultimo spostamento
  const lastSwapDelta = useRef<{ x: number; y: number } | null>(null);
  const ignoreClicksUntil = useRef(0);

  const orderedItems = useMemo(() => {
    if (!draftOrder) return items;
    const byId = new Map(items.map((item) => [item.shelf_item_id, item]));
    return draftOrder.flatMap((id) => byId.get(id) ?? []);
  }, [items, draftOrder]);

  /** Aggiorna la cache dello scaffale e ritorna lo stato precedente per il rollback. */
  async function updateCachedItems(update: (items: ShelfEntry[]) => ShelfEntry[]) {
    await queryClient.cancelQueries({ queryKey: shelfKey });
    const previous = queryClient.getQueryData<ShelfDetail | null>(shelfKey);
    if (previous) {
      queryClient.setQueryData<ShelfDetail>(shelfKey, {
        ...previous,
        items: withPositions(update(previous.items)),
      });
    }
    return previous;
  }

  /** Nome dell'elemento nei messaggi: titolo del libro o nome della decorazione. */
  function labelOf(item: ShelfEntry) {
    return item.item_type === "book"
      ? item.library_item.book.title
      : t(`shelves.decor.items.${item.decor_key}`);
  }

  function invalidateShelves() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: shelfKey }),
      // l'anteprima dell'elenco mostra i primi libri: dipende dall'ordine
      queryClient.invalidateQueries({ queryKey: ["shelves", userId] }),
    ]);
  }

  const reorder = useMutation({
    // in fila: due riordini rapidi arrivano al DB nell'ordine giusto
    scope: { id: `shelf-order-${shelfId}` },
    mutationFn: (order: string[]) => reorderShelf(shelfId, order),
    onMutate: async (order) => {
      const previous = await updateCachedItems((current) => {
        const byId = new Map(current.map((item) => [item.shelf_item_id, item]));
        return order.flatMap((id) => byId.get(id) ?? []);
      });
      setDraftOrder(null);
      return { previous };
    },
    onSuccess: () => {
      if (hintSeen) return;
      setHintSeen(true);
      setBooleanPreference(REORDER_HINT_KEY, true);
    },
    onError: (_error, _order, context) => {
      if (context?.previous) queryClient.setQueryData(shelfKey, context.previous);
      toast.error(t("shelves.reorder.saveError"));
    },
    onSettled: invalidateShelves,
  });

  const undoRemove = useMutation({
    scope: { id: `shelf-order-${shelfId}` },
    // l'elemento torna in coda, poi l'ordine precedente lo rimette al suo posto
    mutationFn: async ({ removed, order }: { removed: ShelfEntry; order: string[] }) => {
      const newId =
        removed.item_type === "book"
          ? await addBookToShelf(shelfId, removed.library_item.id)
          : await addDecorToShelf(shelfId, removed.decor_key);
      await reorderShelf(
        shelfId,
        order.map((id) => (id === removed.shelf_item_id ? newId : id)),
      );
    },
    onError: () => toast.error(t("common.error")),
    onSettled: invalidateShelves,
  });

  const remove = useMutation({
    scope: { id: `shelf-order-${shelfId}` },
    mutationFn: (removed: ShelfEntry) => removeShelfItem(removed.shelf_item_id),
    onMutate: async (removed) => {
      const previous = await updateCachedItems((current) =>
        current.filter((item) => item.shelf_item_id !== removed.shelf_item_id),
      );
      return { previous };
    },
    onSuccess: (_data, removed, context) => {
      const order = context?.previous?.items.map((item) => item.shelf_item_id) ?? [];
      const message =
        removed.item_type === "book"
          ? t("shelves.reorder.removed", { title: labelOf(removed) })
          : t("shelves.decor.removed", { name: labelOf(removed) });
      toast.success(message, {
        duration: UNDO_DURATION_MS,
        action: {
          label: t("shelves.reorder.undo"),
          onClick: () => undoRemove.mutate({ removed, order }),
        },
      });
    },
    onError: (_error, _removed, context) => {
      if (context?.previous) queryClient.setQueryData(shelfKey, context.previous);
      toast.error(t("common.error"));
    },
    onSettled: invalidateShelves,
  });

  const setDisplay = useMutation({
    scope: { id: `shelf-order-${shelfId}` },
    mutationFn: ({ book, display }: { book: ShelfBook; display: ShelfItemDisplay }) =>
      setShelfItemDisplay(book.shelf_item_id, display),
    onMutate: async ({ book, display }) => {
      const previous = await updateCachedItems((current) =>
        current.map((item) =>
          item.item_type === "book" && item.shelf_item_id === book.shelf_item_id ? { ...item, display } : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(shelfKey, context.previous);
      toast.error(t("shelves.display.saveError"));
    },
    onSettled: invalidateShelves,
  });

  /** Apre il menu della posizione ancorato al libro (il suo elemento sulla mensola). */
  function openMenu(book: ShelfBook) {
    const element = document.querySelector(`[data-shelf-item-id="${book.shelf_item_id}"]`);
    if (element) setMenu({ book, rect: element.getBoundingClientRect() });
  }

  function handleDragStart(event: DragStartEvent) {
    lastSwapDelta.current = null;
    setIsDrawerOpen(false);
    setActiveId(String(event.active.id));
    setDraftOrder(items.map((item) => item.shelf_item_id));
  }

  // Riflusso dal vivo: l'elemento trascinato prende subito il posto di quello
  // sotto il puntatore, e il layout a flusso ricompone le righe. Gestito a ogni
  // movimento (non solo al cambio di "over"), così uno spostamento rimandato
  // dalla soglia avviene appena il puntatore si muove abbastanza.
  function handleDragMove({ active, over, delta }: DragMoveEvent) {
    if (over?.id === SHELF_DISPLAY_TAB_ID) {
      setIsDrawerOpen(true);
      return;
    }
    // sopra la zona "rimuovi" e il cassetto l'ordine non cambia: decide il rilascio
    if (
      !over ||
      active.id === over.id ||
      over.id === SHELF_REMOVE_ZONE_ID ||
      displayFromDropId(over.id) !== null
    ) {
      return;
    }
    const last = lastSwapDelta.current;
    if (last && Math.hypot(delta.x - last.x, delta.y - last.y) < MIN_MOVE_BETWEEN_SWAPS_PX) {
      return;
    }
    lastSwapDelta.current = { x: delta.x, y: delta.y };
    setDraftOrder((order) => {
      if (!order) return order;
      const from = order.indexOf(String(active.id));
      const to = order.indexOf(String(over.id));
      return from < 0 || to < 0 ? order : arrayMove(order, from, to);
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    ignoreClicksUntil.current = Date.now() + CLICK_AFTER_DRAG_MS;
    setActiveId(null);
    setIsDrawerOpen(false);
    const original = items.map((item) => item.shelf_item_id);
    const display = displayFromDropId(over?.id) as ShelfItemDisplay | null;
    if (display) {
      // rilasciato su una posizione del cassetto: resta dove è stato portato e
      // cambia come sta. Le due mutation sono in fila: prima l'ordine.
      if (draftOrder && !sameOrder(draftOrder, original)) reorder.mutate(draftOrder);
      else setDraftOrder(null);
      const book = items.find((entry) => entry.shelf_item_id === active.id);
      if (book?.item_type === "book" && book.display !== display) setDisplay.mutate({ book, display });
      return;
    }
    if (over?.id === SHELF_REMOVE_ZONE_ID) {
      setDraftOrder(null);
      const removed = items.find((item) => item.shelf_item_id === active.id);
      if (removed) remove.mutate(removed);
      return;
    }
    if (draftOrder && !sameOrder(draftOrder, original)) reorder.mutate(draftOrder);
    else setDraftOrder(null);
  }

  function handleDragCancel() {
    ignoreClicksUntil.current = Date.now() + CLICK_AFTER_DRAG_MS;
    setActiveId(null);
    setIsDrawerOpen(false);
    setDraftOrder(null);
  }

  const activeItem = activeId
    ? (items.find((item) => item.shelf_item_id === activeId) ?? null)
    : null;

  return {
    data: { orderedItems, activeItem },
    ui: { activeId, showHint: !hintSeen, menu, isDrawerOpen },
    actions: {
      openMenu,
      closeMenu: () => setMenu(null),
      chooseDisplay: (display: ShelfItemDisplay) => {
        if (menu && menu.book.display !== display) setDisplay.mutate({ book: menu.book, display });
        setMenu(null);
      },
      /** true se un click arriva subito dopo un trascinamento (da ignorare). */
      isClickAfterDrag: () => Date.now() < ignoreClicksUntil.current,
      dragStart: handleDragStart,
      dragMove: handleDragMove,
      dragEnd: handleDragEnd,
      dragCancel: handleDragCancel,
    },
  };
}
