import { Feather, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Feature } from "./Feature";

export function LoginFeatures() {
  const { t } = useTranslation();

  return (
    <div className="px-4 pb-4 sm:px-5">
      <Card className="rounded-xl border-0 bg-secondary shadow-none">
        <CardContent className="grid grid-cols-3">
          <Feature
            icon={<ShieldCheck className="h-6 w-6" strokeWidth={1.8} />}
            title={t("auth.featureSafe")}
            sub={t("auth.featureSafeSub")}
          />
          <div className="border-x border-foreground/10">
            <Feature
              icon={<Feather className="h-6 w-6" strokeWidth={1.8} />}
              title={t("auth.featureSimple")}
              sub={t("auth.featureSimpleSub")}
            />
          </div>
          <Feature
            icon={<Smartphone className="h-6 w-6" strokeWidth={1.8} />}
            title={t("auth.featureAnywhere")}
            sub={t("auth.featureAnywhereSub")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
