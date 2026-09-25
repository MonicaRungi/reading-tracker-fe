import type { ReactNode } from "react";
import { toast, type ToastT } from "sonner";

const BASE_DURATION = 4000;
const STAGGER = 2500;

type ToastMethod = (message: string, data: { id: string | number; duration: number }) => unknown;

const METHODS: Partial<Record<NonNullable<ToastT["type"]>, ToastMethod>> = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
  warning: toast.warning,
  normal: toast.message,
  default: toast.message,
};

/**
 * Mostra più toast di successo in ordine "first in, last out": Sonner impila i
 * toast e mette in primo piano l'ultimo, quindi l'ultimo arrivato sparisce per
 * primo e scopre quello sotto. I toast già visibili (es. "Libro aggiunto")
 * vengono prolungati per uscire dopo questi. Aggiornare un toast con lo stesso
 * id ne fa ripartire il timer con la nuova durata.
 */
export function showStackedSuccessToasts(
  items: { id: string; message: string; description?: string; icon?: ReactNode }[],
) {
  if (items.length === 0) return;
  const longest = BASE_DURATION + (items.length - 1) * STAGGER;

  for (const active of toast.getToasts()) {
    if ("dismiss" in active && active.dismiss) continue;
    const current = active as ToastT;
    const method = METHODS[current.type ?? "default"];
    if (!method || typeof current.title !== "string") continue;
    method(current.title, { id: current.id, duration: longest + STAGGER });
  }

  items.forEach((item, index) => {
    toast.success(item.message, {
      id: item.id,
      description: item.description,
      icon: item.icon,
      duration: BASE_DURATION + (items.length - 1 - index) * STAGGER,
    });
  });
}
