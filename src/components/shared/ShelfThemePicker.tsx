import { useTranslation } from "react-i18next";
import type { ShelfTheme } from "@/api/shelves";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SHELF_THEMES, SHELF_THEME_LABEL_KEYS } from "@/lib/shelfThemes";
import { ShelfThemeSwatch } from "./ShelfThemeSwatch";

/** Selettore del tema della mensola: 4 campioni con anteprima. */
export function ShelfThemePicker({
  value,
  onChange,
}: {
  value: ShelfTheme;
  onChange: (theme: ShelfTheme) => void;
}) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as ShelfTheme)}
      aria-label={t("shelves.form.themeLabel")}
      className="grid w-full grid-cols-2 gap-3"
    >
      {SHELF_THEMES.map((theme) => (
        <ToggleGroupItem
          key={theme}
          value={theme}
          className="flex h-auto flex-col gap-2 rounded-2xl border border-border p-2 pb-2.5 text-[13px] font-medium text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-primary data-[state=on]:ring-1 data-[state=on]:ring-primary"
        >
          <ShelfThemeSwatch theme={theme} />
          {t(SHELF_THEME_LABEL_KEYS[theme])}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
