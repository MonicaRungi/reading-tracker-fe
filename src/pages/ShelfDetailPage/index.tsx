import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BackHeader } from "@/components/shared/BackHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ShelfFormSheet } from "@/components/shared/ShelfFormSheet";
import { ShelfMenuSheet } from "@/components/shared/ShelfMenuSheet";
import { useShelfDetailData } from "./hooks/useShelfDetailData";
import { ShelfBoard } from "./components/ShelfBoard";
import { BookDisplayMenu } from "./components/BookDisplayMenu";
import { ShelfHeaderActions } from "./components/ShelfHeaderActions";
import { AddBooksToShelfSheet } from "./sheets/AddBooksToShelfSheet";

export default function ShelfDetailPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useShelfDetailData();

  if (data.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data.shelf) {
    return (
      <div className="flex min-h-svh flex-col">
        <EmptyState
          size="lg"
          icon={Library}
          title={data.isError ? t("common.error") : t("shelves.detail.notFoundTitle")}
          description={data.isError ? undefined : t("shelves.detail.notFoundSubtitle")}
          action={{ label: t("shelves.detail.backToList"), onClick: actions.goToList }}
        />
      </div>
    );
  }

  const { shelf } = data;

  return (
    // altezza del viewport meno la bottom nav (pb-20 di AppLayout): la pagina
    // non scrolla, scorrono solo le mensole dentro il mobile
    <div className="flex h-[calc(100svh-5rem-var(--safe-area-inset-top))] flex-col overflow-hidden">
      <BackHeader
        title={shelf.name}
        subtitle={t("library.bookCount", { count: shelf.books.length })}
        onBack={actions.goToList}
        action={
          <ShelfHeaderActions
            shelfName={shelf.name}
            onAddBooks={actions.addBooks.open}
            onOpenMenu={actions.openShelfMenu}
          />
        }
      />

      {shelf.books.length === 0 ? (
        <EmptyState
          size="lg"
          icon={Library}
          title={t("shelves.detail.emptyTitle")}
          description={t("shelves.detail.emptySubtitle")}
          action={{ label: t("shelves.detail.addBooks"), onClick: actions.addBooks.open }}
        />
      ) : (
        // il mobile riempie l'altezza rimasta, come nel design
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-4 pt-2">
          <ShelfBoard
            theme={shelf.color_theme}
            books={data.reorder.orderedBooks}
            activeBook={data.reorder.activeBook}
            isDrawerOpen={ui.reorder.isDrawerOpen}
            spineUrls={data.spineUrls}
            onPhotoError={actions.refreshSpineUrls}
            showHint={ui.reorder.showHint && shelf.books.length > 1}
            onOpenBook={actions.openBook}
            onOpenMenu={actions.reorder.openMenu}
            onDragStart={actions.reorder.dragStart}
            onDragMove={actions.reorder.dragMove}
            onDragEnd={actions.reorder.dragEnd}
            onDragCancel={actions.reorder.dragCancel}
            className="min-h-0 flex-1"
          />
        </div>
      )}

      <BookDisplayMenu
        target={ui.reorder.menu}
        onChoose={actions.reorder.chooseDisplay}
        onClose={actions.reorder.closeMenu}
      />

      <AddBooksToShelfSheet
        open={ui.addBooks.isOpen}
        options={data.addBooks.options}
        isLoading={data.addBooks.isLoading}
        isLibraryEmpty={data.addBooks.isLibraryEmpty}
        hasNextPage={data.addBooks.hasNextPage}
        isFetchingNextPage={data.addBooks.isFetchingNextPage}
        query={ui.addBooks.query}
        selectedIds={ui.addBooks.selectedIds}
        isAdding={ui.addBooks.isAdding}
        onQueryChange={actions.addBooks.setQuery}
        onToggle={actions.addBooks.toggle}
        onLoadMore={actions.addBooks.loadMore}
        onSubmit={actions.addBooks.submit}
        onClose={actions.addBooks.close}
      />

      <ShelfMenuSheet
        shelfName={ui.menuTarget?.name ?? null}
        onEdit={actions.editFromMenu}
        onDelete={actions.deleteFromMenu}
        onClose={actions.closeMenu}
      />

      <ShelfFormSheet
        open={ui.isFormOpen}
        mode={ui.formMode}
        name={ui.name}
        theme={ui.theme}
        nameError={ui.nameError}
        isSaving={ui.isSaving}
        onNameChange={actions.setName}
        onThemeChange={actions.setTheme}
        onSubmit={actions.submit}
        onClose={actions.closeForm}
      />

      <ConfirmDialog
        open={ui.deleteTarget !== null}
        onOpenChange={actions.setDeleteOpen}
        title={t("shelves.delete.title", { name: ui.deleteTarget?.name ?? "" })}
        description={t("shelves.delete.description")}
        confirmLabel={t("shelves.delete.confirm")}
        isPending={ui.isDeleting}
        onConfirm={actions.confirmDelete}
      />
    </div>
  );
}
