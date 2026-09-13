import { Home, Search, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

const TABS = [
  { to: "/library", icon: Home, labelKey: "nav.library" },
  { to: "/search", icon: Search, labelKey: "nav.search" },
  { to: "/profile", icon: User, labelKey: "nav.profile" },
] as const

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-center border-t border-border bg-card pb-safe">
      {TABS.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 text-xs text-muted-foreground",
              isActive && "text-primary",
            )
          }
        >
          <Icon className="size-5" aria-hidden="true" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}
