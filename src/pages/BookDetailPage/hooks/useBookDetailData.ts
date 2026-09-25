import { enrichBookCover, updateBookPageCount } from "@/api/books";
import type { ReadingStatus } from "@/api/library";
import {
  deleteLibraryItem,
  listLibrary,
  rateItem,
  updateDate,
  updateProgress,
  updateStatus,
} from "@/api/library";
import {
  createReminder,
  deleteReminder,
  getReminderForBook,
} from "@/api/releaseReminders";
import { useAuth } from "@/hooks/useAuth";
import { upcomingReleaseDate } from "@/lib/releaseDate";
import { invalidateProgressQueries } from "@/lib/progressQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useBookDetailData() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  // --- Promemoria di uscita (solo libri con data completa nel futuro) ------
  const releaseDate = upcomingReleaseDate(item?.book.published_date);
  const bookId = item?.book.id;
  const reminderKey = ["release-reminder", user?.id, bookId];

  const { data: reminder } = useQuery({
    queryKey: reminderKey,
    queryFn: () => getReminderForBook(bookId!),
    enabled: Boolean(user && bookId && releaseDate),
  });

  const { mutate: toggleReminder, isPending: isTogglingReminder } = useMutation({
    mutationFn: async () => {
      if (reminder) await deleteReminder(bookId!);
      else await createReminder(user!.id, bookId!, releaseDate!);
    },
    onSuccess: () => {
      toast.success(
        reminder
          ? t("notifications.reminderDisabled")
          : t("notifications.reminderEnabled"),
      );
      void queryClient.invalidateQueries({ queryKey: reminderKey });
    },
    onError: () => toast.error(t("common.error")),
  });

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
      invalidateProgressQueries(queryClient, user?.id),
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
    data: {
      item,
      isLoading,
      percent,
      currentPage,
      pageCount,
      pageCountInput,
      releaseDate,
      hasReminder: Boolean(reminder),
    },
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
      toggleReminder: () => toggleReminder(),
      isTogglingReminder,
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
