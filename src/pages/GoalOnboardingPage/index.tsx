import { useGoalOnboardingData } from "./hooks/useGoalOnboardingData";
import { OnboardingHeader } from "./components/OnboardingHeader";
import { ChooseStep } from "./components/ChooseStep";
import { ReviewStep } from "./components/ReviewStep";

export default function GoalOnboardingPage() {
  const { data, ui, actions } = useGoalOnboardingData();

  return (
    <div className="flex min-h-full flex-col">
      <OnboardingHeader
        current={ui.stepNumber}
        total={ui.stepCount}
        onBack={actions.goBack}
      />

      {ui.step === "review" && data.primaryTarget !== null ? (
        <ReviewStep
          year={data.year}
          primaryChoice={ui.primaryChoice}
          primaryTarget={data.primaryTarget}
          secondaryGoals={data.secondaryGoals}
          isSubmitting={ui.isSubmitting}
          onSubmit={actions.submit}
          onBack={actions.exitToLibrary}
        />
      ) : (
        <ChooseStep
          primaryChoice={ui.primaryChoice}
          customTarget={ui.customTarget}
          primaryTarget={data.primaryTarget}
          secondaryTypes={ui.secondaryTypes}
          secondaryGoals={data.secondaryGoals}
          secondaryTargets={ui.secondaryTargets}
          canContinue={data.canContinue}
          onSelectPrimary={actions.selectPrimary}
          onCustomTargetChange={actions.setCustomTarget}
          onToggleSecondary={actions.toggleSecondary}
          onSecondaryTargetChange={actions.setSecondaryTarget}
          onContinue={actions.goToReview}
        />
      )}
    </div>
  );
}
