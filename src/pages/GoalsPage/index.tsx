import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import { BackHeader } from "@/components/shared/BackHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useGoalsData } from "./hooks/useGoalsData";
import { GoalsBanner } from "./components/GoalsBanner";
import { PrimaryGoalCard } from "./components/PrimaryGoalCard";
import { SecondaryGoalCard } from "./components/SecondaryGoalCard";
import { RenewalPrompt } from "./components/RenewalPrompt";
import { ArchivedGoalsRow } from "./components/ArchivedGoalsRow";
import { RenewGoalSheet } from "./RenewGoalSheet";
import { SecondaryGoalsSheet } from "./SecondaryGoalsSheet";
import { EditGoalTargetSheet } from "./EditGoalTargetSheet";
import { ArchivedGoalsSheet } from "./ArchivedGoalsSheet";

export default function GoalsPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useGoalsData();

  return (
    <div className="flex min-h-full flex-col">
      <BackHeader title={t("goals.detail.title")} onBack={actions.goBack} />

      {data.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex-1 space-y-6 px-4 pb-8 pt-2">
          {ui.banner && (
            <GoalsBanner
              title={ui.banner.title}
              message={ui.banner.message}
              onClose={actions.closeBanner}
            />
          )}

          <section className="space-y-3">
            <h2 className="text-[17px] font-bold text-foreground">
              {t("goals.detail.primaryTitle")}
            </h2>
            <PrimaryGoalCard
              goal={data.primary}
              current={data.primaryCurrent}
              year={data.year}
              onCreate={actions.goToOnboarding}
            />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-[17px] font-bold text-foreground">
                {t("goals.detail.secondaryTitle")}
              </h2>
              <p className="text-[13px] text-muted-foreground">
                {t("goals.detail.secondarySubtitle")}
              </p>
            </div>

            {data.secondaries.map((item) => (
              <SecondaryGoalCard
                key={item.goal.id}
                goal={item.goal}
                current={item.current}
                isScheduled={item.isScheduled}
                startLabel={item.startLabel}
                onEdit={() => actions.openEdit(item.goal)}
                onArchive={() => actions.requestArchive(item.goal)}
              />
            ))}

            {data.renewals.map((renewal) => (
              <RenewalPrompt
                key={renewal.goal.id}
                goal={renewal.goal}
                startLabel={renewal.startLabel}
                onRenew={() => actions.openRenew(renewal.goal)}
                onChange={() => actions.openPickerFor(renewal.goal)}
                onDismiss={() => actions.dismissRenewal(renewal.goal)}
              />
            ))}

            {data.secondaries.length === 0 && data.renewals.length === 0 && (
              <EmptyState size="inline" title={t("goals.detail.secondaryEmpty")} />
            )}

            {data.canAddSecondary && (
              <Button
                variant="outline"
                onClick={actions.openPicker}
                className="h-auto w-full gap-2 rounded-xl border-primary py-3 text-[14px] text-primary"
              >
                <Plus className="size-4" aria-hidden="true" />
                {t("goals.detail.addSecondary")}
              </Button>
            )}

            {data.archived.length > 0 && (
              <ArchivedGoalsRow
                count={data.archived.length}
                onOpen={actions.openArchived}
              />
            )}
          </section>
        </div>
      )}

      <RenewGoalSheet
        goal={ui.renewTarget}
        startLabel={data.renewStartLabel}
        isSaving={ui.isCreating}
        onConfirm={actions.confirmRenew}
        onChange={() => ui.renewTarget && actions.openPickerFor(ui.renewTarget)}
        onClose={actions.closeRenew}
      />

      <SecondaryGoalsSheet
        open={ui.picker !== null}
        types={data.pickerTypes}
        selected={ui.picker?.selected ?? []}
        targets={ui.picker?.targets ?? { days: 0, pages: 0 }}
        startLabels={data.pickerStartLabels}
        isSaving={ui.isCreating}
        onToggle={actions.togglePickerType}
        onTargetChange={actions.setPickerTarget}
        onSave={actions.savePicker}
        onClose={actions.closePicker}
      />

      <EditGoalTargetSheet
        goal={ui.editTarget}
        value={ui.editValue}
        isSaving={ui.isSavingTarget}
        onChange={actions.setEditValue}
        onSave={actions.saveEdit}
        onClose={actions.closeEdit}
      />

      <ConfirmDialog
        open={ui.archiveTarget !== null}
        onOpenChange={(open) => !open && actions.cancelArchive()}
        title={t("goals.detail.archiveTitle")}
        description={t("goals.detail.archiveDescription")}
        confirmLabel={t("goals.detail.archiveConfirm")}
        isPending={ui.isArchiving}
        onConfirm={actions.confirmArchive}
      />

      <ArchivedGoalsSheet
        open={ui.isArchivedOpen}
        goals={data.archived}
        onClose={actions.closeArchived}
      />
    </div>
  );
}
