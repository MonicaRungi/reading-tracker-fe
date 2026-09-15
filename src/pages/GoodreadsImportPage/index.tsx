import { useGoodreadsImportData } from "./hooks/useGoodreadsImportData";
import { GoodreadsImportHeader } from "./components/GoodreadsImportHeader";
import { GoodreadsConnectCard } from "./components/GoodreadsConnectCard";
import { GoodreadsImportPreview } from "./components/GoodreadsImportPreview";
import { GoodreadsImportingState } from "./components/GoodreadsImportingState";
import { GoodreadsImportResult } from "./components/GoodreadsImportResult";
import { GoodreadsImportError } from "./components/GoodreadsImportError";

export default function GoodreadsImportPage() {
  const { data, ui, actions } = useGoodreadsImportData();

  return (
    <div className="flex min-h-full flex-col">
      <GoodreadsImportHeader onBack={actions.goBack} />

      <div className="flex-1 space-y-5 px-4 pb-8">
        <GoodreadsConnectCard
          onFileSelected={actions.selectFile}
          step={ui.step}
        />

        {data.preview && (
          <GoodreadsImportPreview
            preview={data.preview}
            onCancel={actions.reset}
            onConfirm={actions.confirmImport}
            step={ui.step}
          />
        )}

        {ui.step === "importing" && <GoodreadsImportingState />}

        {ui.step === "done" && data.result && (
          <GoodreadsImportResult
            result={data.result}
            onGoToLibrary={actions.goToLibrary}
          />
        )}

        {ui.step === "error" && (
          <GoodreadsImportError message={data.error} onRetry={actions.reset} />
        )}
      </div>
    </div>
  );
}
