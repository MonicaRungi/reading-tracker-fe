import { useTranslation } from "react-i18next";
import { FeatureListItem } from "./FeatureListItem";

export function LoginFeatureList() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 px-7 py-6">
      <FeatureListItem
        illustration="reading-list"
        title={t("auth.featureTrackTitle")}
        description={t("auth.featureTrackSub")}
      />
      <FeatureListItem
        illustration="search"
        title={t("auth.featureDiscoverTitle")}
        description={t("auth.featureDiscoverSub")}
      />
      <FeatureListItem
        illustration="books"
        title={t("auth.featureLibraryTitle")}
        description={t("auth.featureLibrarySub")}
      />
    </div>
  );
}
