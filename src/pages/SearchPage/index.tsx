import { useSearchData } from "./hooks/useSearchData";
import { SearchHeader } from "./components/SearchHeader";
import { ScanPlaceholder } from "./components/ScanPlaceholder";
import { SearchResults } from "./components/SearchResults";
import { AddBookSheet } from "./AddBookSheet";

export default function SearchPage() {
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
        {ui.tab === "scan" && <ScanPlaceholder />}

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
