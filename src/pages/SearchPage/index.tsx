import { useTranslation } from "react-i18next";
import { useSearchData } from "./hooks/useSearchData";
import { SearchHeader } from "./components/SearchHeader";
import { BarcodeScanner } from "./components/BarcodeScanner";
import { SearchResults } from "./components/SearchResults";
import { AddBookSheet } from "./AddBookSheet";
import { Button } from "@/components/ui/button";
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
        {ui.tab === "scan" && ui.scannerOpen && (
          <div className="space-y-4">
            <BarcodeScanner
              key={ui.scanResetKey}
              onDetected={actions.handleDetected}
            />
            <Button
              variant="outline"
              onClick={() => actions.setTab("search")}
              className="h-auto w-full gap-2 rounded-full border-[#E0644A] py-3 text-[14px] font-medium text-[#E0644A]"
            >
              <Keyboard className="size-4" />
              {t("search.manualIsbn")}
            </Button>
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
        isSubmitting={ui.isAddingBook}
        onSubmit={actions.submitAddBook}
        onClose={actions.closeSheet}
      />
    </div>
  );
}
