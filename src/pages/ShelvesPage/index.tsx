import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShelfFormSheet } from "@/components/shared/ShelfFormSheet";
import { ShelfMenuSheet } from "@/components/shared/ShelfMenuSheet";
import { useShelvesData } from "./hooks/useShelvesData";
import { ShelvesHeader } from "./components/ShelvesHeader";
import { ShelfList } from "./components/ShelfList";

export default function ShelvesPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useShelvesData();

  return (
    <div className="flex min-h-full flex-col">
      <ShelvesHeader onCreate={data.isEmpty ? undefined : actions.openCreate} />

      {data.isEmpty ? (
        <EmptyState
          size="lg"
          icon={Library}
          title={t("shelves.emptyTitle")}
          description={t("shelves.emptySubtitle")}
          action={{ label: t("shelves.emptyCta"), onClick: actions.openCreate }}
        />
      ) : (
        <ShelfList
          shelves={data.shelves}
          spineUrls={data.spineUrls}
          onPhotoError={actions.refreshSpineUrls}
          isLoading={data.isLoading}
          onOpenShelf={actions.openShelf}
          onOpenMenu={actions.openMenu}
        />
      )}

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
