import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ScanPlaceholder() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-2xl bg-secondary p-6">
        <BookOpen className="size-12 text-muted-foreground" />
      </div>
      <p className="text-[15px] font-medium text-foreground">
        {t("search.scannerComingSoon")}
      </p>
      <p className="text-[13px] text-muted-foreground">{t("search.scannerHint")}</p>
    </div>
  );
}
