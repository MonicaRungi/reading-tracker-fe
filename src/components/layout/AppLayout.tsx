import { Outlet } from "react-router-dom";
import { useNotificationsRealtime } from "@/hooks/useNotificationsRealtime";
import { PullToRefresh } from "./PullToRefresh";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  useNotificationsRealtime();

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
