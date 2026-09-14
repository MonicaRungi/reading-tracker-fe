import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useProfileData } from "./hooks/useProfileData";
import { ProfileHeader } from "./components/ProfileHeader";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { StatsGrid } from "./components/StatsGrid";
import { ActivitySection } from "./components/ActivitySection";
import { BooksReadSection } from "./components/BooksReadSection";
import { GenresSection } from "./components/GenresSection";
import { SignOutButton } from "./components/SignOutButton";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useProfileData();

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-4 pb-2 pt-4">
        <h1 className="text-[30px] font-bold text-foreground">
          {t("profile.title")}
        </h1>
      </div>

      <div className="flex-1 space-y-5 px-4 pb-8">
        <ProfileHeader
          avatarUrl={data.avatarUrl}
          initials={data.initials}
          displayName={data.displayName}
          email={data.email}
        />

        <ThemeSwitcher value={ui.theme} onChange={actions.setTheme} />

        {data.isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          data.stats && (
            <>
              <StatsGrid stats={data.stats} />

              <ActivitySection
                view={ui.activityView}
                onViewChange={actions.setActivityView}
                data={data.activityChartData}
                total={data.activityTotal}
              />

              <BooksReadSection
                view={ui.booksView}
                onViewChange={actions.setBooksView}
                data={data.booksChartData}
              />

              {data.stats.genres.length > 0 && (
                <GenresSection genres={data.stats.genres} />
              )}
            </>
          )
        )}

        <SignOutButton onClick={actions.signOut} />
      </div>
    </div>
  );
}
