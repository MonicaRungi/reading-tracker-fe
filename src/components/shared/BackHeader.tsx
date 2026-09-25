import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/** Header sticky delle pagine di dettaglio: freccia indietro + titolo. */
export function BackHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
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
      <h1 className="text-[18px] font-bold text-foreground">{title}</h1>
    </div>
  );
}
