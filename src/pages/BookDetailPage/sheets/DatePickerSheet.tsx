import { useState } from "react";
import { useTranslation } from "react-i18next";
import { it } from "date-fns/locale";
import { Sheet } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerSheetProps {
  open: "started" | "finished" | null;
  startedAt: string | null;
  finishedAt: string | null;
  onClose: () => void;
  onSave: (field: "started" | "finished", date: string) => void;
}

export function DatePickerSheet({
  open,
  startedAt,
  finishedAt,
  onClose,
  onSave,
}: DatePickerSheetProps) {
  const { t } = useTranslation();
  const currentValue = open === "started" ? startedAt : finishedAt;
  const label =
    open === "started"
      ? t("bookDetail.startedDateLabel")
      : t("bookDetail.finishedDateLabel");

  // Bozza della data scelta nel calendario: null = nessuna modifica, si mostra
  // il valore salvato. Si azzera alla chiusura, così a ogni apertura lo sheet
  // riparte dalla data del campo interessato.
  const [draft, setDraft] = useState<Date | undefined | null>(null);
  const selected =
    draft !== null ? draft : currentValue ? new Date(currentValue) : undefined;

  function close() {
    setDraft(null);
    onClose();
  }

  function handleSave() {
    if (!selected || !open) return;
    // Formato YYYY-MM-DD senza problemi di timezone
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    onSave(open, `${yyyy}-${mm}-${dd}`);
    close();
  }

  return (
    <Sheet open={open !== null} onOpenChange={(next) => !next && close()}>
      <BottomSheetContent
        className="px-5"
      >
        <h2 className="mb-5 pr-8 text-[20px] font-bold text-foreground">
          {label}
        </h2>

        <Calendar
          key={open}
          mode="single"
          selected={selected}
          onSelect={setDraft}
          defaultMonth={selected}
          locale={it}
          disabled={
            open === "finished" && startedAt
              ? { before: new Date(startedAt) }
              : undefined
          }
          classNames={{
            selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
            today: "text-primary font-semibold",
          }}
        />

        <Button
          onClick={handleSave}
          disabled={!selected}
          className="mb-4 h-auto w-full rounded-xl py-[15px] text-[15px] font-medium disabled:opacity-60"
        >
          {t("bookDetail.confirmDate")}
        </Button>
      </BottomSheetContent>
    </Sheet>
  );
}
