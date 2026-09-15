import { useTranslation } from "react-i18next";
import {
  BookOpen,
  CheckCircle,
  BookMarked,
  Bookmark,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoodreadsStatCard } from "./GoodreadsStatCard";
import type { ImportPreview } from "../hooks/useGoodreadsImportData";

export function GoodreadsImportPreview({
  step,
  preview,
  onCancel,
  onConfirm,
}: {
  step: "upload" | "preview" | "importing" | "done" | "error";
  preview: ImportPreview;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {step !== "done" && (
        <>
          <div>
            <p className="mb-1 text-[17px] font-bold text-foreground">
              {t("import.previewTitle")}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {t("import.previewSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoodreadsStatCard
              icon={<BookOpen className="size-5 text-primary" />}
              value={preview.total}
              label={t("import.statsTotal")}
            />
            <GoodreadsStatCard
              icon={<CheckCircle className="size-5 text-primary" />}
              value={preview.read}
              label={t("import.statsRead")}
            />
            <GoodreadsStatCard
              icon={<BookMarked className="size-5 text-primary" />}
              value={preview.reading}
              label={t("import.statsReading")}
            />
            <GoodreadsStatCard
              icon={<Bookmark className="size-5 text-primary" />}
              value={preview.to_read}
              label={t("import.statsToRead")}
            />
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-muted p-4">
            <Info className="mt-0.5 size-8 shrink-0 text-muted-foreground" />
            {preview.duplicates > 0 ? (
              <div>
                <p className="text-[16px] font-bold text-foreground">
                  {t("import.duplicatesFound", { count: preview.duplicates })}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t("import.duplicatesFoundDescription")}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  {t("import.noDuplicates")}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t("import.noDuplicatesDescription")}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {step === "preview" && (
        <>
          <div>
            <p className="mb-1 text-[17px] font-bold text-foreground">
              {t("import.afterImportTitle")}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {t("import.afterImportDescription")}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="h-auto flex-1 rounded-2xl py-4 text-[15px] font-medium text-muted-foreground"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={onConfirm}
              className="h-auto flex-1 rounded-2xl py-4 text-[15px] font-medium"
            >
              {t("import.continueCta")}
            </Button>
          </div>
        </>
      )}
    </>
  );
}
