import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function GoodreadsImportingState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
      <LoadingSpinner />
      <p className="text-[15px] font-medium text-foreground">
        {t("import.importingTitle")}
      </p>
      <p className="text-[13px] text-muted-foreground">
        {t("import.importingSubtitle")}
      </p>
    </div>
  );
}
