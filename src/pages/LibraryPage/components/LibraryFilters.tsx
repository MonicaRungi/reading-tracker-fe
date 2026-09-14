import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { LibraryFilter } from "../hooks/useLibraryData";

const FILTERS: LibraryFilter[] = ["all", "reading", "read", "to_read", "abandoned"];

export function LibraryFilters({
  value,
  onChange,
}: {
  value: LibraryFilter;
  onChange: (value: LibraryFilter | "") => void;
}) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onChange}
      className="mb-4 flex w-full justify-start gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {FILTERS.map((filter) => (
        <ToggleGroupItem
          key={filter}
          value={filter}
          className="shrink-0 rounded-full border border-border px-4 py-2 text-[13px] font-medium text-muted-foreground data-[state=on]:border-transparent data-[state=on]:bg-accent data-[state=on]:text-primary"
        >
          {filter === "all" ? t("library.filterAll") : t(`status.${filter}`)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
