import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { it } from "date-fns/locale";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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

  const [selected, setSelected] = useState<Date | undefined>(
    currentValue ? new Date(currentValue) : undefined,
  );

  // Riallinea la data selezionata al campo interessato ogni volta che lo sheet si
  // apre (il componente resta montato tra un'apertura e l'altra, quindi lo state
  // non si reinizializza da solo).
  useEffect(() => {
    if (open) {
      setSelected(currentValue ? new Date(currentValue) : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentValue]);

  function handleSave() {
    if (!selected || !open) return;
    // Formato YYYY-MM-DD senza problemi di timezone
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, "0");
    const dd = String(selected.getDate()).padStart(2, "0");
    onSave(open, `${yyyy}-${mm}-${dd}`);
    onClose();
  }

  return (
    <Sheet open={open !== null} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-[22px] px-5 pb-safe pt-2"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />

        <h2 className="mb-5 pr-8 text-[20px] font-bold text-foreground">
          {label}
        </h2>

        <Calendar
          key={open}
          mode="single"
          selected={selected}
          onSelect={setSelected}
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
      </SheetContent>
    </Sheet>
  );
}
