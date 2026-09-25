import { BellRing, CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatWeekdayDate } from "@/lib/format";

/**
 * Libro non ancora uscito (data completa nel futuro): offre il promemoria per
 * il giorno dell'uscita. Usata nel foglio "Aggiungi libro" e nel dettaglio.
 */
export function ReleaseReminderCard({
  releaseDate,
  active,
  isPending = false,
  onToggle,
}: {
  releaseDate: string;
  active: boolean;
  isPending?: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const date = formatWeekdayDate(releaseDate);
  const Icon = active ? BellRing : CalendarClock;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-foreground">
          {active
            ? t("notifications.reminderOn")
            : t("notifications.releaseOn", { date })}
        </p>
        <p className="text-[12px] text-muted-foreground">
          {active
            ? t("notifications.reminderOnHint", { date })
            : t("notifications.reminderAsk")}
        </p>
      </div>
      <Button
        variant={active ? "ghost" : "default"}
        onClick={onToggle}
        disabled={isPending}
        aria-pressed={active}
        className="h-auto shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium"
      >
        {active ? t("notifications.reminderDisable") : t("notifications.reminderEnable")}
      </Button>
    </div>
  );
}
