import { useTranslation } from "react-i18next";
import { CheckCircle, SkipForward, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoodreadsStatCard } from "./GoodreadsStatCard";
import type { ImportResult } from "../hooks/useGoodreadsImportData";

export function GoodreadsImportResult({
  result,
  onGoToLibrary,
}: {
  result: ImportResult;
  onGoToLibrary: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent">
          <CheckCircle className="size-8 text-primary" />
        </div>
        <p className="text-[18px] font-bold text-foreground">
          {t("import.doneTitle")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <GoodreadsStatCard
          size="sm"
          icon={<CheckCircle className="size-4 text-primary" />}
          value={result.imported}
          label={t("import.statImported")}
        />
        <GoodreadsStatCard
          size="sm"
          icon={<SkipForward className="size-4 text-muted-foreground" />}
          value={result.skipped}
          label={t("import.statSkipped")}
        />
        <GoodreadsStatCard
          size="sm"
          icon={<XCircle className="size-4 text-destructive" />}
          value={result.failed}
          label={t("import.statFailed")}
        />
      </div>

      {result.errors.length > 0 && (
        <div className="space-y-2 rounded-2xl bg-muted p-4">
          <p className="text-[15px] font-bold text-foreground">
            {t("import.notImportedTitle")}
          </p>
          {result.errors.slice(0, 5).map((e) => (
            <div key={e.title} className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">{e.title}</span> — {e.reason}
            </div>
          ))}
          {result.errors.length > 5 && (
            <p className="text-[12px] text-muted-foreground">
              {t("import.moreErrors", { count: result.errors.length - 5 })}
            </p>
          )}
        </div>
      )}

      <Button
        onClick={onGoToLibrary}
        className="h-auto w-full rounded-2xl py-4 text-[15px] font-medium"
      >
        {t("import.goToLibrary")}
      </Button>
    </div>
  );
}
