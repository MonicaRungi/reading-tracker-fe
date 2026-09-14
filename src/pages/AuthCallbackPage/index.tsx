import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthCallbackData } from "./hooks/useAuthCallbackData";
import { AuthCallbackErrorView } from "./components/AuthCallbackErrorView";

export default function AuthCallbackPage() {
  const { ui, actions } = useAuthCallbackData();

  if (ui.hasError) {
    return <AuthCallbackErrorView onRetry={actions.goToLogin} />;
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
