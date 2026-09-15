import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function GoodreadsImportError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-[18px] font-bold text-foreground">
        {t("import.errorTitle")}
      </p>
      {message && <p className="text-[14px] text-muted-foreground">{message}</p>}
      <Button
        variant="outline"
        onClick={onRetry}
        className="h-auto rounded-2xl border-primary px-8 py-3 text-[14px] font-medium text-primary"
      >
        {t("common.retry")}
      </Button>
    </div>
  );
}
