import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getShelf } from "@/api/shelves";
import { useAuth } from "@/hooks/useAuth";
import { useShelfEditor } from "@/hooks/useShelfEditor";
import { useAddBooksToShelf } from "./useAddBooksToShelf";

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

  return {
    data: {
      shelf,
      isLoading: shelfQuery.isLoading,
      isNotFound: shelfQuery.isSuccess && shelf === null,
      isError: shelfQuery.isError,
      addBooks: addBooks.data,
    },
    ui: {
      ...editor.ui,
      addBooks: addBooks.ui,
    },
    actions: {
      ...editor.actions,
      goToList,
      openBook: (libraryItemId: string) => navigate(`/book/${libraryItemId}`),
      openShelfMenu: () => shelf && editor.actions.openMenu(shelf),
      addBooks: addBooks.actions,
    },
  };
}
