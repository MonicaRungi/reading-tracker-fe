import { Outlet } from "react-router-dom";

/** App shell senza bottom nav, per flussi guidati (es. onboarding obiettivi). */
export function FullScreenLayout() {
  return (
    <div className="min-h-svh bg-background pt-safe pb-safe">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
