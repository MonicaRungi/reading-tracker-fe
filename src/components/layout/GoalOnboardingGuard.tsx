import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listGoals } from "@/api/goals";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { findPrimaryGoalForYear } from "@/lib/goals";

/**
 * L'onboarding obiettivi è raggiungibile solo se non esiste già un goal
 * primary/year per l'anno corrente (vincolo DB: al più uno per anno).
 */
export function GoalOnboardingGuard() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals", userId],
    queryFn: () => listGoals(),
    enabled: Boolean(userId),
  });

  if (isLoading || !goals) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  const hasPrimary = Boolean(
    findPrimaryGoalForYear(goals, new Date().getFullYear()),
  );
  return hasPrimary ? <Navigate to="/library" replace /> : <Outlet />;
}
