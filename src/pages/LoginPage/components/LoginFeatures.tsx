import { useTranslation } from "react-i18next";
import { Feature } from "./Feature";
import { ShieldIcon } from "@/assets/icons/ShieldIcon";
import { PenIcon } from "@/assets/icons/PenIcon";
import { PhoneIcon } from "@/assets/icons/PhoneIcon";

export function LoginFeatures() {
  const { t } = useTranslation();

  return (
    <div className="bg-secondary px-7 pt-5 pb-5">
      <div className="flex justify-around">
        <Feature
          icon={<ShieldIcon />}
          title={t("auth.featureSafe")}
          sub={t("auth.featureSafeSub")}
        />
        <Feature
          icon={<PenIcon />}
          title={t("auth.featureSimple")}
          sub={t("auth.featureSimpleSub")}
        />
        <Feature
          icon={<PhoneIcon />}
          title={t("auth.featureAnywhere")}
          sub={t("auth.featureAnywhereSub")}
        />
      </div>
    </div>
  );
}
