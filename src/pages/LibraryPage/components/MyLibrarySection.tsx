import { useTranslation } from "react-i18next";
import type { LibraryItem } from "@/api/library";
import type { LibraryFilter } from "../hooks/useLibraryData";
import { LibraryFilters } from "./LibraryFilters";
import { LibraryGrid } from "./LibraryGrid";

export function MyLibrarySection({
  items,
  isLoading,
  filter,
  onFilterChange,
}: {
  items: LibraryItem[];
  isLoading: boolean;
  filter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter | "") => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="flex-1 px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-foreground">{t("library.myLibrary")}</h2>
      </div>

      <LibraryFilters value={filter} onChange={onFilterChange} />
      <LibraryGrid items={items} isLoading={isLoading} filter={filter} />
    </section>
  );
}
