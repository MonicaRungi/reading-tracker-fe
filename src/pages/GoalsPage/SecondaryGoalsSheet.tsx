import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import type { SecondaryGoalType } from "@/api/goals";
import { SecondaryGoalsPicker } from "@/components/shared/SecondaryGoalsPicker";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";

export function SecondaryGoalsSheet({
  open,
  types,
  selected,
  targets,
  startLabels,
  isSaving,
  onToggle,
  onTargetChange,
  onSave,
  onClose,
}: {
  open: boolean;
  types: SecondaryGoalType[];
  selected: SecondaryGoalType[];
  targets: Record<SecondaryGoalType, number>;
  startLabels: string[];
  isSaving: boolean;
  onToggle: (type: SecondaryGoalType) => void;
  onTargetChange: (type: SecondaryGoalType, target: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent
        className="flex max-h-[90vh] flex-col gap-0"
      >
        <div className="shrink-0 space-y-1 px-5 pb-4 pr-12">
          <SheetTitle className="text-[20px] font-bold text-foreground">
            {t("goals.detail.pickerTitle")}
          </SheetTitle>
          <SheetDescription className="text-[13px] text-muted-foreground">
            {t("goals.detail.pickerDescription")}
          </SheetDescription>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          {types.length > 0 ? (
            <SecondaryGoalsPicker
              idPrefix="renew-secondary-goal"
              types={types}
              selected={selected}
              targets={targets}
              showHints
              onToggle={onToggle}
              onTargetChange={onTargetChange}
            />
          ) : (
            <EmptyState
              size="inline"
              title={t("goals.detail.pickerNothingAvailable")}
            />
          )}

          {startLabels.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3">
              <CalendarDays className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-[14px] font-semibold text-foreground">
                  {t("goals.detail.pickerStart")}
                </p>
                {startLabels.map((label) => (
                  <p key={label} className="text-[13px] text-muted-foreground">
                    {label}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border px-5 pb-4 pt-3">
          <Button
            onClick={onSave}
            disabled={selected.length === 0 || isSaving}
            className="h-auto w-full rounded-xl py-[14px] text-[15px] font-medium disabled:opacity-60"
          >
            {isSaving ? t("common.loading") : t("goals.detail.pickerSave")}
          </Button>
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
