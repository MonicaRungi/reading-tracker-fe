import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  listLibrary,
  updateStatus,
  updateProgress,
  rateItem,
  updateDate,
} from "@/api/library";
import type { ReadingStatus } from "@/api/library";
import { updateBookPageCount } from "@/api/books";
import { deleteLibraryItem } from "@/api/library";
import { enrichBookCover } from "@/api/books";

export function useBookDetailData() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [progressInput, setProgressInput] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<
    "started" | "finished" | null
  >(null);
  const [showMenu, setShowMenu] = useState(false);
  const [pageCountInput, setPageCountInput] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["library", user?.id],
    queryFn: () => listLibrary(),
    enabled: Boolean(user),
  });

  const item = items.find((i) => i.id === id);

  const currentPage = progressInput ?? item?.current_page ?? 0;
  const pageCount = item?.book.page_count ?? 0;
  const percent =
    pageCount > 0
      ? Math.min(100, Math.round((currentPage / pageCount) * 100))
      : 0;

  function invalidate() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["library", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["stats", user?.id] }),
    ]);
  }

  const { mutate: mutateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (status: ReadingStatus) => updateStatus(id!, status),
    onSuccess: invalidate,
    onError: () => toast.error("Errore nell'aggiornamento dello stato"),
  });

  const { mutate: mutateProgress, isPending: isUpdatingProgress } = useMutation(
    {
      mutationFn: (page: number) => updateProgress(user!.id, id!, page),
      onSuccess: async () => {
        await invalidate();
        setProgressInput(null);
      },
      onError: () => toast.error("Errore nell'aggiornamento dell'avanzamento"),
    },
  );

  const { mutate: mutateRating, isPending: isRating } = useMutation({
    mutationFn: (rating: number) => rateItem(id!, rating),
    onSuccess: invalidate,
    onError: () => toast.error("Errore nel salvataggio del voto"),
  });

  const { mutate: mutateSavePageCount, isPending: isSavingPageCount } =
    useMutation({
      mutationFn: () =>
        updateBookPageCount(item!.book.id, Number(pageCountInput)),
      onSuccess: invalidate,
      onError: () => toast.error("Errore nel salvataggio"),
    });

  const { mutate: mutateDate } = useMutation({
    mutationFn: ({
      field,
      date,
    }: {
      field: "started" | "finished";
      date: string;
    }) => updateDate(id!, field, date),
    onSuccess: () => {
      void invalidate();
      setShowDatePicker(null);
    },
    onError: () => toast.error("Errore nel salvataggio della data"),
  });

  const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteLibraryItem(id!),
    onSuccess: async () => {
      await invalidate();
      navigate(-1); // torna alla libreria dopo la cancellazione
    },
    onError: () => toast.error("Errore nella rimozione del libro"),
  });

  const { mutate: enrichCover } = useMutation({
    mutationFn: () => enrichBookCover(item!.book.id, item!.book.isbn13!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", user?.id] });
    },
    // silenzioso su errore — non blocca nulla
  });

  return {
    data: { item, isLoading, percent, currentPage, pageCount, pageCountInput },
    ui: { progressInput, showDatePicker, showMenu },
    actions: {
      goBack: () => navigate(-1),
      updateStatus: mutateStatus,
      updateProgress: mutateProgress,
      rate: mutateRating,
      updatePageCount: mutateSavePageCount,
      saveDate: (field: "started" | "finished", date: string) =>
        mutateDate({ field, date }),
      deleteItem: mutateDelete,
      enrichCover,
      setProgressInput,
      setShowDatePicker,
      setShowMenu,
      setPageCountInput,
      isSavingPageCount,
      isUpdatingStatus,
      isUpdatingProgress,
      isRating,
      isDeleting,
    },
  };
}
