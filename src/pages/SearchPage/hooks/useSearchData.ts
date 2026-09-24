import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { searchBooks, lookupBookByIsbn } from "@/api/books";
import type { BookMeta } from "@/api/books";
import { addLibraryItem, listLibrary } from "@/api/library";
import type { LibraryItem, ReadingStatus } from "@/api/library";
import { createLibraryMatcher } from "@/lib/bookMatch";
import { hapticFeedback } from "@/lib/haptics";
import { invalidateProgressQueries } from "@/lib/progressQueries";
import { listShelves, createShelf } from "@/api/shelves";

export type SearchTab = "search" | "scan";

export interface SearchResult {
  book: BookMeta;
  libraryItem: LibraryItem | null;
}

export function useSearchData() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTabState] = useState<SearchTab>("search");
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null);
  const [status, setStatusState] = useState<ReadingStatus>("to_read");
  const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [isAddingShelf, setIsAddingShelf] = useState(false);
  const [scanResetKey, setScanResetKey] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);

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

  const { data: libraryItems = [] } = useQuery({
    queryKey: ["library", user?.id],
    queryFn: () => listLibrary(),
    enabled: !!user,
  });

  const findInLibrary = useMemo(
    () => createLibraryMatcher(libraryItems),
    [libraryItems],
  );

  const results = useMemo<SearchResult[]>(
    () =>
      (data ?? []).map((book) => ({
        book,
        libraryItem: findInLibrary(book),
      })),
    [data, findInLibrary],
  );

  // Forza il remount di BarcodeScanner (via key) così la fotocamera, ferma dopo
  // un rilevamento, riparte per scansionare il prossimo libro — sia dopo una
  // chiusura riuscita dello sheet, sia dopo un errore/ISBN non trovato. Non ha
  // effetto se lo scanner non è montato (tab diverso da "scan").
  const resetScanner = useCallback(() => {
    setScanResetKey((k) => k + 1);
  }, []);

  const closeSheet = useCallback(() => {
    setSelectedBook(null);
    resetScanner();
  }, [resetScanner]);

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
      void invalidateProgressQueries(queryClient, user?.id);
      toast.success(t("search.bookAdded"));
      closeSheet();
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
    if (next === "scan") setScannerOpen(true);
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

  // Libro già in libreria → apri il dettaglio invece di riaggiungerlo.
  const selectResult = useCallback(
    ({ book, libraryItem }: SearchResult) => {
      if (libraryItem) navigate(`/book/${libraryItem.id}`);
      else openSheet(book);
    },
    [navigate, openSheet],
  );

  const { mutate: handleScan } = useMutation({
    mutationFn: (isbn: string) => lookupBookByIsbn(isbn),
    onSuccess: (book) => {
      if (!book) {
        toast.error(t("search.scanBookNotFound"));
        resetScanner();
        return;
      }
      const libraryItem = findInLibrary(book);
      if (libraryItem) {
        toast.info(t("search.alreadyInLibrary"));
        navigate(`/book/${libraryItem.id}`);
      } else {
        openSheet(book);
      }
    },
    onError: () => {
      toast.error(t("search.scanLookupError"));
      resetScanner();
    },
  });

  const handleScanError = useCallback(() => {
    toast.error(t("search.scanLookupError"));
    resetScanner();
  }, [t, resetScanner]);

  const confirmNewShelf = useCallback(() => {
    if (newShelfName.trim()) addShelf();
  }, [addShelf, newShelfName]);

  async function handleDetected(isbn: string) {
    hapticFeedback();
    setScannerOpen(false);

    await handleScan(isbn);
  }

  return {
    data: {
      results,
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
      scanResetKey,
      scannerOpen,
    },
    actions: {
      setTab,
      setQuery,
      openSheet,
      selectResult,
      closeSheet,
      handleDetected,
      handleScanError,
      setStatus,
      setSelectedShelfIds,
      setNewShelfName,
      startAddingShelf: () => setIsAddingShelf(true),
      confirmNewShelf,
      submitAddBook: () => addBook(),
    },
  };
}
