import { Outlet } from "react-router-dom";
import { useNotificationsRealtime } from "@/hooks/useNotificationsRealtime";
import { PullToRefresh } from "./PullToRefresh";

/** App shell senza bottom nav, per flussi guidati (onboarding, obiettivi). */
export function FullScreenLayout() {
  // Anche qui arrivano notifiche (es. badge sbloccato rinnovando un obiettivo
  // già soddisfatto): i due layout non sono mai montati insieme, niente doppioni.
  useNotificationsRealtime();

  return (
    <div className="min-h-svh bg-background pt-safe pb-safe">
      <PullToRefresh />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
