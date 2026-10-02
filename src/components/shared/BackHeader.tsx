import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/** Header sticky delle pagine di dettaglio: freccia indietro + titolo (+ azione). */
export function BackHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  /** Riga secondaria sotto il titolo (es. "11 libri"). */
  subtitle?: string;
  onBack: () => void;
  /** Azione opzionale a destra (es. "Segna tutte come lette"). */
  action?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-[-1px] z-10 flex items-center gap-1 bg-background px-4 pb-2 pt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label={t("bookDetail.back")}
        className="rounded-full text-foreground"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[18px] font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-[13px] leading-tight text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
