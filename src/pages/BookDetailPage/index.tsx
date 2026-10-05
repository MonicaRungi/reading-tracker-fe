import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBookDetailData } from "./hooks/useBookDetailData";
import { BookDetailHeader } from "./components/BookDetailHeader";
import { BookHero } from "./components/BookHero";
import { IncompleteDataBadge } from "./components/IncompleteDataBadge";
import { ReadingDates } from "./components/ReadingDates";
import { ProgressSection } from "./components/ProgressSection";
import { RatingSection } from "./components/RatingSection";
import { StatusCta } from "./components/StatusCta";
import { BookMenuSheet } from "./sheets/BookMenuSheet";
import { DatePickerSheet } from "./sheets/DatePickerSheet";
import { ReleaseReminderCard } from "@/components/shared/ReleaseReminderCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SpineSection } from "./components/SpineSection";
import { SpineCaptureSheet } from "./sheets/SpineCaptureSheet";
import { useEffect } from "react";

export default function BookDetailPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useBookDetailData();

  // Arricchimento copertina lazy
  useEffect(() => {
    if (!data.item) return;
    if (data.item.book.cover_url) return;
    if (!data.item.book.isbn13) return;
    if (data.item.book.source !== "goodreads") return;
    actions.enrichCover();
  }, [data.item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <BookHero
          item={item}
          spine={
            <SpineSection
              item={item}
              spineUrl={data.spine.spineUrl}
              onOpen={actions.spine.open}
              onPhotoError={actions.spine.refreshUrls}
            />
          }
        />

        {!item.book.isbn13 && <IncompleteDataBadge />}

        {data.releaseDate && (
          <ReleaseReminderCard
            releaseDate={data.releaseDate}
            active={data.hasReminder}
            isPending={actions.isTogglingReminder}
            onToggle={actions.toggleReminder}
          />
        )}

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
        <div className="fixed inset-x-0 bottom-16 py-4 z-10 px-4 bg-background">
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

      <SpineCaptureSheet
        open={ui.spine.isOpen}
        step={ui.spine.step}
        hasPhoto={data.spine.hasPhoto}
        photo={data.spine.photo}
        quad={data.spine.quad}
        processed={data.spine.processed}
        preset={ui.spine.preset}
        showBlurWarning={ui.spine.showBlurWarning}
        isLoadingPhoto={ui.spine.isLoadingPhoto}
        isProcessing={ui.spine.isProcessing}
        isSaving={ui.spine.isSaving}
        onClose={actions.spine.close}
        onPickFile={actions.spine.pickFile}
        onQuadChange={actions.spine.setQuad}
        onProcess={actions.spine.processCrop}
        onPresetChange={actions.spine.setPreset}
        onAcceptBlur={actions.spine.acceptBlur}
        onRetake={actions.spine.retake}
        onBackToCrop={actions.spine.backToCrop}
        onSave={actions.spine.save}
        onRemove={actions.spine.askRemove}
      />

      <ConfirmDialog
        open={ui.spine.confirmRemove}
        onOpenChange={actions.spine.setConfirmRemove}
        title={t("spine.remove.title")}
        description={t("spine.remove.description")}
        confirmLabel={t("spine.remove.confirm")}
        isPending={ui.spine.isRemoving}
        onConfirm={actions.spine.confirmRemove}
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
