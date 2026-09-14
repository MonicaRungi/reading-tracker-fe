import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { searchBooks } from "@/api/books";
import type { BookMeta } from "@/api/books";
import { addLibraryItem } from "@/api/library";
import type { ReadingStatus } from "@/api/library";
import { listShelves, createShelf } from "@/api/shelves";

export type SearchTab = "search" | "scan";

export function useSearchData() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [tab, setTabState] = useState<SearchTab>("search");
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null);
  const [status, setStatusState] = useState<ReadingStatus>("to_read");
  const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [isAddingShelf, setIsAddingShelf] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", "search", debouncedQuery],
    queryFn: () => searchBooks(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
  });

  const { data: shelves = [] } = useQuery({
    queryKey: ["shelves", user?.id],
    queryFn: () => listShelves(),
    enabled: !!user,
  });

  const { mutate: addBook, isPending: isAddingBook } = useMutation({
    mutationFn: () =>
      addLibraryItem(user!.id, {
        book: selectedBook!,
        status,
        shelf_ids: selectedShelfIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["stats", user?.id] });
      toast.success(t("search.bookAdded"));
      setSelectedBook(null);
    },
    onError: () => toast.error(t("common.error")),
  });

  const { mutate: addShelf, isPending: isCreatingShelf } = useMutation({
    mutationFn: () => createShelf(user!.id, newShelfName.trim()),
    onSuccess: (shelf) => {
      queryClient.invalidateQueries({ queryKey: ["shelves", user?.id] });
      setSelectedShelfIds((prev) => [...prev, shelf.id]);
      setNewShelfName("");
      setIsAddingShelf(false);
    },
    onError: () => toast.error(t("common.error")),
  });

  const setTab = useCallback((next: SearchTab | "") => {
    if (next) setTabState(next);
  }, []);

  const setStatus = useCallback((next: ReadingStatus | "") => {
    if (next) setStatusState(next);
  }, []);

  const openSheet = useCallback((book: BookMeta) => {
    setStatusState("to_read");
    setSelectedShelfIds([]);
    setNewShelfName("");
    setIsAddingShelf(false);
    setSelectedBook(book);
  }, []);

  const closeSheet = useCallback(() => setSelectedBook(null), []);

  const confirmNewShelf = useCallback(() => {
    if (newShelfName.trim()) addShelf();
  }, [addShelf, newShelfName]);

  return {
    data: {
      results: data ?? [],
      isLoading,
      isError,
      hasQuery: debouncedQuery.trim().length >= 2,
      shelves,
    },
    ui: {
      tab,
      query,
      selectedBook,
      status,
      selectedShelfIds,
      newShelfName,
      isAddingShelf,
      isAddingBook,
      isCreatingShelf,
    },
    actions: {
      setTab,
      setQuery,
      openSheet,
      closeSheet,
      setStatus,
      setSelectedShelfIds,
      setNewShelfName,
      startAddingShelf: () => setIsAddingShelf(true),
      confirmNewShelf,
      submitAddBook: () => addBook(),
    },
  };
}
