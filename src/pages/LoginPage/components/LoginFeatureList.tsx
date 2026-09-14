import { BookOpen, Feather, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeatureListItem } from "./FeatureListItem";

export function LoginFeatureList() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 px-7 py-6">
      <FeatureListItem
        icon={<BookOpen className="h-5 w-5" strokeWidth={1.8} />}
        title={t("auth.featureTrackTitle")}
        description={t("auth.featureTrackSub")}
      />
      <FeatureListItem
        icon={<Feather className="h-5 w-5" strokeWidth={1.8} />}
        title={t("auth.featureDiscoverTitle")}
        description={t("auth.featureDiscoverSub")}
      />
      <FeatureListItem
        icon={<Heart className="h-5 w-5" strokeWidth={1.8} />}
        title={t("auth.featureLibraryTitle")}
        description={t("auth.featureLibrarySub")}
      />
    </div>
  );
}
