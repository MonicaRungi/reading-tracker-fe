import { Outlet } from "react-router-dom";
import { useBadgeUnlockToast } from "@/hooks/useBadgeUnlockToast";
import { PullToRefresh } from "./PullToRefresh";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  useBadgeUnlockToast();

  return (
    <div className="min-h-svh bg-background pt-safe">
      <main className="pb-20">
        <Outlet />
      </main>
      <PullToRefresh />
      <BottomNav />
    </div>
  );
}
