import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PageCountPrompt({
  value,
  onChange,
  onSave,
  isSaving,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const { t } = useTranslation();
  const isInvalid = !value || Number(value) < 1;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
          <BookOpen className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-foreground">
            {t("bookDetail.pageCountQuestion")}
          </p>
          <p className="text-[13px] text-muted-foreground">{t("bookDetail.pageCountHint")}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
          <Input
            type="number"
            min={1}
            placeholder={t("bookDetail.pageCountPlaceholder")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0"
          />
          <span className="h-4 w-px shrink-0 bg-border" />
          <span className="shrink-0 text-[13px] text-muted-foreground">
            {t("bookDetail.pages")}
          </span>
        </div>
        <Button
          disabled={isInvalid || isSaving}
          onClick={onSave}
          className="h-auto shrink-0 rounded-full px-5 py-2.5 text-[13px] font-medium disabled:opacity-50"
        >
          {t("bookDetail.setPageCount")}
        </Button>
      </div>
    </div>
  );
}
