import { useTranslation } from "react-i18next";
import { useSearchData } from "./hooks/useSearchData";
import { SearchHeader } from "./components/SearchHeader";
import { BarcodeScanner } from "./components/BarcodeScanner";
import { SearchResults } from "./components/SearchResults";
import { AddBookSheet } from "./AddBookSheet";
import { Keyboard } from "lucide-react";

export default function SearchPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useSearchData();

  return (
    <div className="flex min-h-full flex-col">
      <SearchHeader
        tab={ui.tab}
        query={ui.query}
        onTabChange={actions.setTab}
        onQueryChange={actions.setQuery}
      />

      <div className="flex-1 px-4">
        {ui.tab === "scan" && (
          <div className="space-y-4">
            <BarcodeScanner
              key={ui.scanResetKey}
              onDetected={actions.handleScan}
            />
            <button
              onClick={() => actions.setTab("search")}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E0644A] py-3 text-[14px] font-medium text-[#E0644A]"
            >
              <Keyboard className="size-4" />
              {t("search.manualIsbn")}
            </button>
          </div>
        )}

        {ui.tab === "search" && (
          <SearchResults
            isLoading={data.isLoading}
            hasQuery={data.hasQuery}
            results={data.results}
            onAddBook={actions.openSheet}
          />
        )}
      </div>

      <AddBookSheet
        book={ui.selectedBook}
        status={ui.status}
        onStatusChange={actions.setStatus}
        shelves={data.shelves}
        selectedShelfIds={ui.selectedShelfIds}
        onSelectedShelfIdsChange={actions.setSelectedShelfIds}
        isAddingShelf={ui.isAddingShelf}
        newShelfName={ui.newShelfName}
        onNewShelfNameChange={actions.setNewShelfName}
        onStartAddingShelf={actions.startAddingShelf}
        onConfirmNewShelf={actions.confirmNewShelf}
        isSubmitting={ui.isAddingBook}
        onSubmit={actions.submitAddBook}
        onClose={actions.closeSheet}
      />
    </div>
  );
}
