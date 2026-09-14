import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

export function AuthGuard() {
  const { user, isLoading } = useAuth();

  if (bypassAuth) return <Outlet />;

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
