import { Pointer } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Suggerimento del gesto, in fondo alle mensole finché non si è riordinato una volta. */
export function ReorderHint() {
  const { t } = useTranslation();

  return (
    <p className="flex shrink-0 flex-col items-center gap-2 py-6 text-center text-[13px] text-(--shelf-hint)">
      <Pointer className="size-5" aria-hidden="true" />
      {t("shelves.reorder.hint")}
    </p>
  );
}
