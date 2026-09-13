import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background pt-safe">
      <main className="px-4 pt-4 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
