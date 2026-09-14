import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export function ProgressEditor({
  currentPage,
  pageCount,
  percent,
  onPageChange,
  onCommit,
  isSaving,
}: {
  currentPage: number;
  pageCount: number;
  percent: number;
  onPageChange: (page: number) => void;
  onCommit: (page: number) => void;
  isSaving: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">{t("bookDetail.progress")}</span>
        <span className="text-[13px] font-semibold text-primary">
          pag. {currentPage} / {pageCount} · {percent}%
        </span>
      </div>

      <Slider
        min={0}
        max={pageCount}
        value={[currentPage]}
        onValueChange={([page]) => onPageChange(page)}
        onValueCommit={([page]) => onCommit(page)}
        disabled={isSaving}
      />

      <div className="flex items-center gap-2">
        <span className="text-[13px] text-muted-foreground">{t("bookDetail.pageLabel")}</span>
        <Input
          type="number"
          min={0}
          max={pageCount}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          onBlur={() => onCommit(currentPage)}
          disabled={isSaving}
          className="h-auto w-20 rounded-xl border-border py-1.5 text-center text-[14px] shadow-none"
        />
        <span className="text-[13px] text-muted-foreground">
          {t("bookDetail.pageOf", { count: pageCount })}
        </span>
      </div>
    </>
  );
}
