import { useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/shared/SearchField";
import type { LibraryItem } from "@/api/library";
import type { LibraryFilter } from "../hooks/useLibraryData";
import { LibraryFilters } from "./LibraryFilters";
import { LibraryGrid } from "./LibraryGrid";

export function MyLibrarySection({
  items,
  isLoading,
  filter,
  onFilterChange,
  query,
  onQueryChange,
}: {
  items: LibraryItem[];
  isLoading: boolean;
  filter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter | "") => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);

  function closeSearch() {
    setSearchOpen(false);
    onQueryChange("");
  }

  return (
    <section className="flex-1">
      <div className="sticky top-15 z-10 bg-background px-4 pb-2 pt-3">
        <div className="mb-3 flex items-center justify-between">
          {searchOpen ? (
            <>
              <div className="flex-1">
                <SearchField
                  value={query}
                  onChange={onQueryChange}
                  placeholder={t("library.searchPlaceholder")}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.cancel")}
                onClick={closeSearch}
                className="ml-2 h-9 w-9 shrink-0 rounded-full text-muted-foreground"
              >
                <X className="size-5" />
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-[17px] font-bold text-foreground">
                {t("library.myLibrary")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("library.searchPlaceholder")}
                onClick={() => setSearchOpen(true)}
                className="h-9 w-9 shrink-0 rounded-full bg-secondary text-muted-foreground"
              >
                <Search className="size-5" />
              </Button>
            </>
          )}
        </div>

        <LibraryFilters value={filter} onChange={onFilterChange} />
      </div>

      <div className="px-4">
        <LibraryGrid items={items} isLoading={isLoading} filter={filter} />
      </div>
    </section>
  );
}
