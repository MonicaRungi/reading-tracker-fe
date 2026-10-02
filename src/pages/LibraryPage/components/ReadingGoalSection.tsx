import { ChevronDown, ChevronRight, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReadingGoal } from "@/api/goals";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatNumber } from "@/lib/format";
import { GoalProgressRing } from "./GoalProgressRing";

export function ReadingGoalSection({
  goal,
  current,
  year,
  isOpen,
  onOpenChange,
  onCreateGoal,
  onOpenGoals,
}: {
  goal: ReadingGoal | null;
  current: number;
  year: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGoal: () => void;
  onOpenGoals: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="px-4 pt-1 transition-[padding] duration-200 data-[state=closed]:pb-3"
      asChild
    >
      <section>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            aria-label={
              isOpen
                ? t("goals.librarySectionHide")
                : t("goals.librarySectionShow")
            }
            className="group -mx-1 h-auto w-[calc(100%+0.5rem)] justify-between rounded-lg px-1 py-0.5 hover:bg-transparent aria-expanded:bg-transparent dark:hover:bg-transparent"
          >
            <h2 className="text-[17px] font-bold text-foreground">
              {t("goals.librarySectionTitle")}
            </h2>
            <ChevronDown
              className="size-5 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90"
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>

        {/* -mx-4 + px-4: l'overflow-hidden dell'animazione non taglia l'ombra della card */}
        <CollapsibleContent className="-mx-4 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="px-4 pb-4 pt-3">
            {goal ? (
              <Button
                variant="ghost"
                onClick={onOpenGoals}
                className="h-auto w-full justify-start gap-4 whitespace-normal rounded-2xl bg-accent px-4 py-4 shadow-card text-left font-normal hover:bg-accent active:opacity-80"
              >
                <GoalProgressRing ratio={current / goal.target} />
                <div className="min-w-0 flex-1">
                  <p className="text-[20px] font-bold text-foreground">
                    {t("goals.primaryProgress", {
                      count: goal.target,
                      current: formatNumber(current),
                      target: formatNumber(goal.target),
                    })}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {current >= goal.target
                      ? t("goals.annualGoalReached")
                      : t("goals.annualGoal")}
                  </p>
                </div>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={onCreateGoal}
                className="h-auto w-full justify-start gap-4 whitespace-normal rounded-2xl bg-accent px-4 py-4 shadow-card text-left font-normal hover:bg-accent active:opacity-80"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background">
                  <Target className="size-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-foreground">
                    {t("goals.emptyTitle", { year })}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {t("goals.emptySubtitle")}
                  </p>
                </div>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
