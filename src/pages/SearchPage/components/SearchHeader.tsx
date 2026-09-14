import { useTranslation } from "react-i18next";
import type { SearchTab } from "../hooks/useSearchData";
import { SearchModeToggle } from "./SearchModeToggle";
import { SearchField } from "./SearchField";

export function SearchHeader({
  tab,
  query,
  onTabChange,
  onQueryChange,
}: {
  tab: SearchTab;
  query: string;
  onTabChange: (tab: SearchTab | "") => void;
  onQueryChange: (query: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="px-4 pb-3 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[30px] font-bold text-foreground">{t("search.title")}</h1>
      </div>

      <div className="mb-4">
        <SearchModeToggle value={tab} onChange={onTabChange} />
      </div>

      {tab === "search" && <SearchField value={query} onChange={onQueryChange} />}
    </div>
  );
}
