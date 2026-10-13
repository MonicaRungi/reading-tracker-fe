import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDecorToShelf } from "@/api/shelves";

/**
 * Sheet "Decorazioni": un tocco su un oggetto lo mette in fondo alla mensola
 * (la posizione la assegna il trigger DB) e chiude lo sheet.
 */
export function useAddDecor({ userId, shelfId }: { userId: string | undefined; shelfId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const add = useMutation({
    // in fila con riordino e rimozioni dello stesso scaffale
    scope: { id: `shelf-order-${shelfId}` },
    mutationFn: (decorKey: string) => addDecorToShelf(shelfId, decorKey),
    onSuccess: () => {
      setIsOpen(false);
      return queryClient.invalidateQueries({ queryKey: ["shelf", userId, shelfId] });
    },
    onError: () => toast.error(t("shelves.decor.addError")),
  });

  return {
    ui: { isOpen, addingKey: add.isPending ? add.variables : null },
    actions: {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (decorKey: string) => {
        if (!add.isPending) add.mutate(decorKey);
      },
    },
  };
}
