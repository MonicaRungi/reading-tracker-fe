import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SearchTab } from "../hooks/useSearchData";

export function SearchModeToggle({
  value,
  onChange,
}: {
  value: SearchTab;
  onChange: (value: SearchTab | "") => void;
}) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onChange}
      className="w-full gap-0 rounded-full bg-secondary p-1"
    >
      <ToggleGroupItem
        value="search"
        className="flex-1 rounded-full py-2.5 text-[14px] font-medium text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        {t("search.tabSearch")}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="scan"
        className="flex-1 rounded-full py-2.5 text-[14px] font-medium text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        {t("search.tabScan")}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
