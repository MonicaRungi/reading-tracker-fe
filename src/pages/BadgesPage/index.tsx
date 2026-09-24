import { useTranslation } from "react-i18next";
import { BadgeDetailSheet } from "@/components/shared/BadgeDetailSheet";
import { FeaturedBadgesSection } from "@/components/shared/FeaturedBadgesSection";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useBadgesData } from "./hooks/useBadgesData";
import { BadgesHeader } from "./components/BadgesHeader";
import { AllBadgesSection } from "./components/AllBadgesSection";
import { FeaturedBadgesSheet } from "./FeaturedBadgesSheet";

export default function BadgesPage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useBadgesData();

  return (
    <div className="flex min-h-full flex-col">
      <BadgesHeader onBack={actions.goBack} />

      {data.isLoadingBadges ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex-1 space-y-6 px-4 pb-8 pt-2">
          <FeaturedBadgesSection
            badges={data.featuredBadges}
            maxFeatured={data.maxFeatured}
            actionLabel={t("badges.edit")}
            onAction={actions.openPicker}
            onSelect={actions.openBadge}
          />
          <AllBadgesSection
            badges={data.badges}
            unlocked={data.unlockedBadgeCount}
            onSelect={actions.openBadge}
          />
        </div>
      )}

      <BadgeDetailSheet
        badge={data.selectedBadge}
        progress={data.selectedBadgeProgress}
        canFeatureMore={data.canFeatureMore}
        maxFeatured={data.maxFeatured}
        isTogglingFeatured={ui.isTogglingFeatured}
        onToggleFeatured={actions.toggleBadgeFeatured}
        onClose={actions.closeBadge}
      />

      <FeaturedBadgesSheet
        open={ui.isPickerOpen}
        badges={data.badges}
        selectedIds={data.pickerDraft}
        maxFeatured={data.maxFeatured}
        isSaving={ui.isSavingPicker}
        onToggle={actions.togglePickerBadge}
        onSave={actions.savePicker}
        onClose={actions.closePicker}
      />
    </div>
  );
}
