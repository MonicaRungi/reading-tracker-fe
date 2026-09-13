import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
      <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("search.placeholder")}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-hint focus:outline-none"
      />
    </div>
  )
}
