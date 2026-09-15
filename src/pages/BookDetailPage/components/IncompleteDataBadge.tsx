import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function IncompleteDataBadge() {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted p-4">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[13px] font-medium text-foreground">
          {t("bookDetail.incompleteData")}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {t("bookDetail.incompleteDataHint")}
        </p>
      </div>
    </div>
  );
}
