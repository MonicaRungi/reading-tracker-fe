import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  createShelf,
  deleteShelf,
  isShelfNameTaken,
  updateShelf,
} from "@/api/shelves";
import type { ShelfTheme } from "@/api/shelves";
import { DEFAULT_SHELF_THEME } from "@/lib/shelfThemes";
import { validateShelfName } from "@/lib/shelfName";
import type { ShelfNameError } from "@/lib/shelfName";

/** Quanto serve di uno scaffale per menu, modifica ed eliminazione. */
export interface ShelfRef {
  id: string;
  name: string;
  color_theme: ShelfTheme;
}

type FormMode = { mode: "create" } | { mode: "edit"; shelf: ShelfRef };

/**
 * Menu ⋯, form crea/modifica ed eliminazione di uno scaffale. Condiviso da
 * elenco scaffali e dettaglio: ogni page hook lo compone nel suo { data, ui, actions }.
 */
export function useShelfEditor({
  onCreated,
  onDeleted,
}: {
  onCreated?: (shelfId: string) => void;
  onDeleted?: () => void;
} = {}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [menuTarget, setMenuTarget] = useState<ShelfRef | null>(null);
  const [form, setForm] = useState<FormMode | null>(null);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<ShelfTheme>(DEFAULT_SHELF_THEME);
  const [nameError, setNameError] = useState<ShelfNameError | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShelfRef | null>(null);

  function invalidateShelves() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["shelves", userId] }),
      queryClient.invalidateQueries({ queryKey: ["shelf", userId] }),
    ]);
  }

  const save = useMutation({
    mutationFn: async (target: FormMode) => {
      const input = { name: name.trim(), color_theme: theme };
      if (target.mode === "create") return (await createShelf(userId!, input)).id;
      await updateShelf(target.shelf.id, input);
      return target.shelf.id;
    },
    onSuccess: async (shelfId, target) => {
      await invalidateShelves();
      toast.success(
        target.mode === "create" ? t("shelves.toast.created") : t("shelves.toast.updated"),
      );
      setForm(null);
      if (target.mode === "create") onCreated?.(shelfId);
    },
    onError: (error) => {
      if (isShelfNameTaken(error)) setNameError("taken");
      else toast.error(t("common.error"));
    },
  });

  const remove = useMutation({
    mutationFn: (shelf: ShelfRef) => deleteShelf(shelf.id),
    onSuccess: async (_, shelf) => {
      // il dettaglio dello scaffale eliminato non va rifetchato: si toglie e basta
      queryClient.removeQueries({ queryKey: ["shelf", userId, shelf.id] });
      await queryClient.invalidateQueries({ queryKey: ["shelves", userId] });
      toast.success(t("shelves.toast.deleted"));
      setDeleteTarget(null);
      onDeleted?.();
    },
    onError: () => toast.error(t("common.error")),
  });

  function openForm(next: FormMode) {
    setMenuTarget(null);
    setName(next.mode === "edit" ? next.shelf.name : "");
    setTheme(next.mode === "edit" ? next.shelf.color_theme : DEFAULT_SHELF_THEME);
    setNameError(null);
    setForm(next);
  }

  function submit() {
    if (!form || save.isPending) return;
    const error = validateShelfName(name);
    setNameError(error);
    if (!error) save.mutate(form);
  }

  return {
    ui: {
      menuTarget,
      isFormOpen: form !== null,
      formMode: form?.mode ?? "create",
      name,
      theme,
      nameError,
      isSaving: save.isPending,
      deleteTarget,
      isDeleting: remove.isPending,
    },
    actions: {
      openMenu: setMenuTarget,
      closeMenu: () => setMenuTarget(null),
      openCreate: () => openForm({ mode: "create" }),
      editFromMenu: () => menuTarget && openForm({ mode: "edit", shelf: menuTarget }),
      closeForm: () => setForm(null),
      setName: (value: string) => {
        setName(value);
        if (nameError) setNameError(null);
      },
      setTheme,
      submit,
      deleteFromMenu: () => {
        setDeleteTarget(menuTarget);
        setMenuTarget(null);
      },
      setDeleteOpen: (open: boolean) => {
        if (!open && !remove.isPending) setDeleteTarget(null);
      },
      confirmDelete: () => deleteTarget && remove.mutate(deleteTarget),
    },
  };
}
