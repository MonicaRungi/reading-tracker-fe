import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getShelf } from "@/api/shelves";
import type { ShelfBook } from "@/api/shelves";
import { useAuth } from "@/hooks/useAuth";
import { useShelfEditor } from "@/hooks/useShelfEditor";
import { useSpineUrls } from "@/hooks/useSpineUrls";
import { useAddBooksToShelf } from "./useAddBooksToShelf";
import { useShelfReorder } from "./useShelfReorder";

// riferimento stabile: un [] nuovo a ogni render invaliderebbe i memo del riordino
const EMPTY_BOOKS: ShelfBook[] = [];

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

  const shelvedItemIds = useMemo(
    () => new Set(shelf?.books.map((book) => book.library_item.id) ?? []),
    [shelf],
  );
  const addBooks = useAddBooksToShelf({ userId, shelfId, shelvedItemIds });
  const reorder = useShelfReorder({ userId, shelfId, books: shelf?.books ?? EMPTY_BOOKS });
  // URL firmati di tutte le costole con foto dello scaffale, in un'unica richiesta
  const spinePaths = useMemo(
    () => shelf?.books.map((book) => book.library_item.spine_path) ?? [],
    [shelf],
  );
  const spineUrls = useSpineUrls(spinePaths);

  return {
    data: {
      shelf,
      isLoading: shelfQuery.isLoading,
      isNotFound: shelfQuery.isSuccess && shelf === null,
      isError: shelfQuery.isError,
      addBooks: addBooks.data,
      reorder: reorder.data,
      spineUrls: spineUrls.urls,
    },
    ui: {
      ...editor.ui,
      addBooks: addBooks.ui,
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
      reorder: reorder.actions,
      refreshSpineUrls: spineUrls.refresh,
    },
  };
}
