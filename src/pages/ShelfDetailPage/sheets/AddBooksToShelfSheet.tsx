import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { LibraryItem } from "@/api/library";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LoadMoreTrigger } from "@/components/shared/LoadMoreTrigger";
import { SearchField } from "@/components/shared/SearchField";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import { AddBookOption } from "../components/AddBookOption";

export function AddBooksToShelfSheet({
  open,
  options,
  isLoading,
  isLibraryEmpty,
  hasNextPage,
  isFetchingNextPage,
  query,
  selectedIds,
  isAdding,
  onQueryChange,
  onToggle,
  onLoadMore,
  onSubmit,
  onClose,
}: {
  open: boolean;
  options: LibraryItem[];
  isLoading: boolean;
  isLibraryEmpty: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  query: string;
  selectedIds: ReadonlySet<string>;
  isAdding: boolean;
  onQueryChange: (query: string) => void;
  onToggle: (libraryItemId: string) => void;
  onLoadMore: () => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const count = selectedIds.size;
  // la lista scrolla dentro lo sheet: è la root della sentinella di paginazione
  const [listNode, setListNode] = useState<HTMLDivElement | null>(null);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      {/* altezza fissa, così lo sheet non salta mentre la ricerca filtra la lista;
          con la variante data-[side=bottom] per battere l'h-auto di SheetContent */}
      <BottomSheetContent className="flex flex-col gap-0 px-5 data-[side=bottom]:h-[85svh]">
        <SheetTitle className="pr-8 text-[20px] font-bold text-foreground">
          {t("shelves.addBooks.title")}
        </SheetTitle>

        <div className="py-3">
          <SearchField
            value={query}
            onChange={onQueryChange}
            placeholder={t("library.searchPlaceholder")}
          />
        </div>

        {/* overflow-x-hidden: l'area di tocco del checkbox (after:-inset-x-3)
            sporgerebbe a destra creando uno scroll orizzontale */}
        <div ref={setListNode} className="-mx-2 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : isLibraryEmpty ? (
            <EmptyState size="inline" title={t("shelves.addBooks.emptyLibrary")} />
          ) : options.length === 0 && !hasNextPage ? (
            <EmptyState
              size="inline"
              title={t("shelves.addBooks.noResults")}
              description={t("shelves.addBooks.noResultsSub")}
            />
          ) : (
            <>
              {options.map((item) => (
                <AddBookOption
                  key={item.id}
                  item={item}
                  checked={selectedIds.has(item.id)}
                  onToggle={() => onToggle(item.id)}
                />
              ))}
              {hasNextPage && (
                <LoadMoreTrigger
                  onLoadMore={onLoadMore}
                  isLoading={isFetchingNextPage}
                  root={listNode}
                />
              )}
            </>
          )}
        </div>

        <div className="pb-5 pt-3">
          <Button
            onClick={onSubmit}
            disabled={count === 0 || isAdding}
            className="h-auto w-full rounded-xl py-[14px] text-[15px] font-medium disabled:opacity-60"
          >
            {isAdding
              ? t("common.loading")
              : count === 0
                ? t("shelves.addBooks.selectBooks")
                : t("shelves.addBooks.submit", { count })}
          </Button>
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
