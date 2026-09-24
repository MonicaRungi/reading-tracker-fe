import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLibraryData } from "./hooks/useLibraryData";
import { LibraryHeader } from "./components/LibraryHeader";
import { ContinueReadingSection } from "./components/ContinueReadingSection";
import { MyLibrarySection } from "./components/MyLibrarySection";
import { ReadingGoalSection } from "./components/ReadingGoalSection";

export default function LibraryPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useLibraryData();

  return (
    <div className="flex min-h-full flex-col">
      <LibraryHeader />

      {!data.isLoadingGoals && (
        <ReadingGoalSection
          goal={data.primaryGoal}
          current={data.primaryGoalCurrent}
          year={data.year}
          onCreateGoal={actions.goToGoalOnboarding}
        />
      )}

      {data.isEmpty ? (
        <EmptyState
          size="lg"
          icon={BookOpen}
          title={t("library.emptyTitle")}
          description={t("library.emptySubtitle")}
          action={{ label: t("library.emptyCta"), onClick: actions.goToSearch }}
        />
      ) : (
        <>
          {data.reading.length > 0 && <ContinueReadingSection items={data.reading} />}

          <MyLibrarySection
            items={data.grid}
            isLoading={data.isLoading}
            filter={ui.filter}
            onFilterChange={actions.setFilter}
            query={ui.query}
            onQueryChange={actions.setQuery}
          />
        </>
      )}
    </div>
  );
}
