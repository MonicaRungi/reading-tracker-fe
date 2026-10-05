import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listLibraryPage } from "@/api/library";
import { addBooksToShelf } from "@/api/shelves";
import { useDebounce } from "@/hooks/useDebounce";

const PAGE_SIZE = 30;

/**
 * Sheet "Aggiungi libri": libreria paginata con ricerca server-side,
 * multi-selezione, esclusi i libri già sullo scaffale.
 */
export function useAddBooksToShelf({
  userId,
  shelfId,
  shelvedItemIds,
}: {
  userId: string | undefined;
  shelfId: string;
  shelvedItemIds: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const debouncedQuery = useDebounce(query.trim(), 300);

  // Stessa chiave della griglia "Tutti" della libreria: la cache è condivisa
  // e le mutation sulla libreria la invalidano già.
  const libraryQuery = useInfiniteQuery({
    queryKey: ["library", userId, "page", "all", debouncedQuery],
    queryFn: ({ pageParam }) =>
      listLibraryPage({ query: debouncedQuery, offset: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(userId) && isOpen,
  });

  const options = useMemo(
    () =>
      (libraryQuery.data?.pages ?? [])
        .flatMap((page) => page.items)
        .filter((item) => !shelvedItemIds.has(item.id)),
    [libraryQuery.data, shelvedItemIds],
  );

  const add = useMutation({
    mutationFn: () => addBooksToShelf(shelfId, [...selectedIds]),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["shelf", userId, shelfId] }),
        queryClient.invalidateQueries({ queryKey: ["shelves", userId] }),
      ]);
      toast.success(t("shelves.toast.booksAdded", { count: selectedIds.size }));
      setIsOpen(false);
    },
    onError: () => toast.error(t("common.error")),
  });

  return {
    data: {
      options,
      isLoading: libraryQuery.isLoading,
      hasNextPage: libraryQuery.hasNextPage,
      isFetchingNextPage: libraryQuery.isFetchingNextPage,
      // libreria vuota (non una ricerca senza risultati)
      isLibraryEmpty: libraryQuery.isSuccess && !debouncedQuery && options.length === 0 &&
        (libraryQuery.data?.pages[0]?.total ?? 0) === 0,
    },
    ui: {
      isOpen,
      query,
      selectedIds,
      isAdding: add.isPending,
    },
    actions: {
      open: () => {
        setQuery("");
        setSelectedIds(new Set());
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
      setQuery,
      toggle: (libraryItemId: string) =>
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(libraryItemId)) next.delete(libraryItemId);
          else next.add(libraryItemId);
          return next;
        }),
      loadMore: () => void libraryQuery.fetchNextPage(),
      submit: () => {
        if (selectedIds.size > 0 && !add.isPending) add.mutate();
      },
    },
  };
}
