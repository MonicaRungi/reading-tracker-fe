import { Calendar, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/format";

export function DateBox({
  label,
  value,
  onTap,
}: {
  label: string;
  value: string | null;
  onTap: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onTap}
      className="flex flex-1 flex-col gap-1 rounded-xl border border-border px-4 py-3 text-left"
    >
      <span className="flex items-center gap-1.5 text-[11px] text-hint">
        <Calendar className="size-3" />
        {label}
      </span>
      <span className="flex items-center justify-between gap-2">
        <span className={`text-[15px] ${value ? "text-foreground" : "text-hint"}`}>
          {value ? formatDate(value) : t("bookDetail.noDate")}
        </span>
        <Pencil className="size-3.5 shrink-0 text-primary" />
      </span>
    </button>
  );
}
