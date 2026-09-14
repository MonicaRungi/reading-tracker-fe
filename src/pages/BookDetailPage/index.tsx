import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBookDetailData } from "./hooks/useBookDetailData";
import { BookDetailHeader } from "./components/BookDetailHeader";
import { BookHero } from "./components/BookHero";
import { ReadingDates } from "./components/ReadingDates";
import { ProgressSection } from "./components/ProgressSection";
import { RatingSection } from "./components/RatingSection";
import { StatusCta } from "./components/StatusCta";
import { BookMenuSheet } from "./components/BookMenuSheet";
import { DatePickerSheet } from "./components/DatePickerSheet";

export default function BookDetailPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useBookDetailData();

  if (data.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data.item) {
    return (
      <div className="flex min-h-svh flex-col">
        <EmptyState
          size="lg"
          icon={BookOpen}
          title={t("bookDetail.notFound")}
        />
      </div>
    );
  }

  const { item } = data;
  const canRate = item.status === "read" || item.status === "abandoned";
  const showProgress = item.status === "reading";
  const showCta = item.status === "to_read" || item.status === "reading";

  return (
    <div className="flex min-h-full flex-col">
      <BookDetailHeader
        onBack={actions.goBack}
        onOpenMenu={() => actions.setShowMenu(true)}
      />

      <div className={cn("flex-1 space-y-5 px-4 pb-8", showCta && "pb-28")}>
        <BookHero item={item} />

        <ReadingDates
          startedAt={item.started_at}
          finishedAt={item.finished_at}
          onTapStarted={() => actions.setShowDatePicker("started")}
          onTapFinished={() => actions.setShowDatePicker("finished")}
        />

        {showProgress && (
          <ProgressSection
            currentPage={data.currentPage}
            pageCount={data.pageCount}
            percent={data.percent}
            pageCountInput={data.pageCountInput}
            onPageCountInputChange={actions.setPageCountInput}
            onSavePageCount={actions.updatePageCount}
            isSavingPageCount={actions.isSavingPageCount}
            onPageChange={actions.setProgressInput}
            onCommitPage={actions.updateProgress}
            isUpdatingProgress={actions.isUpdatingProgress}
          />
        )}

        <RatingSection
          rating={item.rating}
          canRate={canRate}
          onRate={actions.rate}
        />

        {item.book.description && (
          <p className="text-[15px] leading-relaxed text-foreground">
            {item.book.description}
          </p>
        )}
      </div>

      {showCta && (
        <div className="fixed inset-x-0 bottom-20 z-10 px-4">
          <StatusCta
            status={item.status}
            isUpdating={actions.isUpdatingStatus}
            onAdvance={actions.updateStatus}
          />
        </div>
      )}

      <BookMenuSheet
        open={ui.showMenu}
        status={item.status}
        onOpenChange={actions.setShowMenu}
        onMarkAbandoned={() => {
          actions.updateStatus("abandoned");
          actions.setShowMenu(false);
        }}
        onResetToToRead={() => {
          actions.updateStatus("to_read");
          actions.setShowMenu(false);
        }}
        onDelete={() => {
          actions.deleteItem();
          actions.setShowMenu(false);
        }}
      />

      <DatePickerSheet
        open={ui.showDatePicker}
        startedAt={item.started_at}
        finishedAt={item.finished_at}
        onClose={() => actions.setShowDatePicker(null)}
        onSave={actions.saveDate}
      />
    </div>
  );
}
