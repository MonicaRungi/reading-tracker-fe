import { Outlet } from "react-router-dom";
import { useBadgeUnlockToast } from "@/hooks/useBadgeUnlockToast";

/** App shell senza bottom nav, per flussi guidati (onboarding, obiettivi). */
export function FullScreenLayout() {
  // Anche qui si possono sbloccare badge (es. rinnovo di un obiettivo già
  // soddisfatto): i due layout non sono mai montati insieme, niente doppioni.
  useBadgeUnlockToast();

  return (
    <div className="min-h-svh bg-background pt-safe pb-safe">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
