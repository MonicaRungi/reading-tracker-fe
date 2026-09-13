import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { formatNumber } from "@/lib/format"
import type { ThemePreference } from "@/api/profile"
import { useProfileData } from "./hooks/useProfileData"

const THEME_OPTIONS: { value: ThemePreference; labelKey: string }[] = [
  { value: "light", labelKey: "profile.themeLight" },
  { value: "dark", labelKey: "profile.themeDark" },
  { value: "auto", labelKey: "profile.themeAuto" },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const { data, ui, actions } = useProfileData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{data.email}</p>
      </div>

      {data.isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-semibold text-foreground">
              {formatNumber(data.stats?.totalBooksRead ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("profile.booksRead")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-semibold text-foreground">
              {formatNumber(data.stats?.totalPagesRead ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{t("profile.pagesRead")}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("profile.theme")}</p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, labelKey }) => (
            <Button
              key={value}
              type="button"
              variant={ui.theme === value ? "default" : "outline"}
              size="sm"
              onClick={() => actions.setTheme(value)}
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>
      </div>

      <Button type="button" variant="outline" onClick={() => actions.signOut()}>
        {t("auth.signOut")}
      </Button>
    </div>
  )
}
