import { useTranslation } from "react-i18next";
import { PageCountPrompt } from "./PageCountPrompt";
import { ProgressEditor } from "./ProgressEditor";

export function ProgressSection({
  currentPage,
  pageCount,
  percent,
  pageCountInput,
  onPageCountInputChange,
  onSavePageCount,
  isSavingPageCount,
  onPageChange,
  onCommitPage,
  isUpdatingProgress,
}: {
  currentPage: number;
  pageCount: number;
  percent: number;
  pageCountInput: string;
  onPageCountInputChange: (value: string) => void;
  onSavePageCount: () => void;
  isSavingPageCount: boolean;
  onPageChange: (page: number) => void;
  onCommitPage: (page: number) => void;
  isUpdatingProgress: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <span className="text-[15px] font-semibold text-foreground">
        {t("bookDetail.progress")}
      </span>

      {pageCount === 0 ? (
        <PageCountPrompt
          value={pageCountInput}
          onChange={onPageCountInputChange}
          onSave={onSavePageCount}
          isSaving={isSavingPageCount}
        />
      ) : (
        <ProgressEditor
          currentPage={currentPage}
          pageCount={pageCount}
          percent={percent}
          onPageChange={onPageChange}
          onCommit={onCommitPage}
          isSaving={isUpdatingProgress}
        />
      )}
    </div>
  );
}
