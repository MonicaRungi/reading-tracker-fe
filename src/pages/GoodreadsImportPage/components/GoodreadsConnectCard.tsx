import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoodreadsIcon } from "@/components/shared/GoodreadsIcon";

const FEATURES = [
  { icon: BookOpen, labelKey: "import.featureBooks" },
  { icon: Star, labelKey: "import.featureRatings" },
  { icon: Shield, labelKey: "import.featurePrivacy" },
] as const;

export function GoodreadsConnectCard({
  step,
  onFileSelected,
}: {
  step: "upload" | "preview" | "importing" | "done" | "error";
  onFileSelected: (file: File) => void;
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="space-y-4 rounded-2xl bg-accent p-4">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted shadow">
            <GoodreadsIcon className="size-8 text-foreground" />
          </div>
          <div>
            <p className="text-[18px] font-bold text-foreground">
              {t("import.connectTitle")}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {t("import.connectDescription")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FEATURES.map(({ icon: Icon, labelKey }) => (
            <div key={labelKey} className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-primary" />
              <span className="text-[14px] text-foreground">{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {step === "upload" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="h-auto w-full rounded-2xl py-4 text-[15px] font-medium"
          >
            {t("import.connectCta")}
          </Button>
        </>
      )}
    </>
  );
}
