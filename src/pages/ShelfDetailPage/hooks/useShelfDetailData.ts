import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getShelf } from "@/api/shelves";
import type { ShelfBook, ShelfEntry } from "@/api/shelves";
import { useAuth } from "@/hooks/useAuth";
import { useShelfEditor } from "@/hooks/useShelfEditor";
import { useSpineUrls } from "@/hooks/useSpineUrls";
import { useAddBooksToShelf } from "./useAddBooksToShelf";
import { useAddDecor } from "./useAddDecor";
import { useShelfReorder } from "./useShelfReorder";

// riferimento stabile: un [] nuovo a ogni render invaliderebbe i memo del riordino
const EMPTY_ITEMS: ShelfEntry[] = [];

export function useShelfDetailData() {
  const { shelfId = "" } = useParams<{ shelfId: string }>();
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const shelfQuery = useQuery({
    queryKey: ["shelf", userId, shelfId],
    queryFn: () => getShelf(shelfId),
    enabled: Boolean(userId) && Boolean(shelfId),
  });

  const shelf = shelfQuery.data ?? null;
  const goToList = () => navigate("/shelves");

  const editor = useShelfEditor({ onDeleted: goToList });

  const items = shelf?.items ?? EMPTY_ITEMS;
  // i libri dello scaffale (le decorazioni non contano nel conteggio né in "Aggiungi libri")
  const books = useMemo(
    () => items.filter((item): item is ShelfBook => item.item_type === "book"),
    [items],
  );
  const shelvedItemIds = useMemo(() => new Set(books.map((book) => book.library_item.id)), [books]);
  const addBooks = useAddBooksToShelf({ userId, shelfId, shelvedItemIds });
  const addDecor = useAddDecor({ userId, shelfId });
  const reorder = useShelfReorder({ userId, shelfId, items });
  // URL firmati di tutti i dorsi con foto dello scaffale, in un'unica richiesta
  const spinePaths = useMemo(() => books.map((book) => book.library_item.spine_path), [books]);
  const spineUrls = useSpineUrls(spinePaths);

  return {
    data: {
      shelf,
      isLoading: shelfQuery.isLoading,
      isNotFound: shelfQuery.isSuccess && shelf === null,
      isError: shelfQuery.isError,
      bookCount: books.length,
      isEmpty: items.length === 0,
      addBooks: addBooks.data,
      reorder: reorder.data,
      spineUrls: spineUrls.urls,
    },
    ui: {
      ...editor.ui,
      addBooks: addBooks.ui,
      addDecor: addDecor.ui,
      reorder: reorder.ui,
    },
    actions: {
      ...editor.actions,
      goToList,
      openBook: (libraryItemId: string) => {
        if (!reorder.actions.isClickAfterDrag()) navigate(`/book/${libraryItemId}`);
      },
      openShelfMenu: () => shelf && editor.actions.openMenu(shelf),
      addBooks: addBooks.actions,
      addDecor: addDecor.actions,
      reorder: reorder.actions,
      refreshSpineUrls: spineUrls.refresh,
    },
  };
}
