import { Camera, ImageIcon, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const TIP_KEYS = ["light", "straight", "close"] as const;

/** Prima tappa: scatto o galleria, con i consigli; se c'è già una foto, anche "Rimuovi". */
export function SpineChooseStep({
  hasPhoto,
  isLoading,
  onPickFile,
  onRemove,
}: {
  hasPhoto: boolean;
  isLoading: boolean;
  onPickFile: (file: File | null) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <ul className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
        {TIP_KEYS.map((key) => (
          <li key={key} className="flex gap-2.5 text-[14px] text-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {t(`spine.capture.tips.${key}`)}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-3">
        {/* fotocamera nativa: HDR e messa a fuoco di sistema, funziona anche nella PWA iOS */}
        <Button asChild disabled={isLoading} className="h-auto gap-2 rounded-xl py-[14px] text-[15px]">
          <label>
            <Camera className="size-5" aria-hidden="true" />
            {t("spine.capture.camera")}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              disabled={isLoading}
              className="sr-only"
              onChange={(event) => {
                onPickFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
          </label>
        </Button>
        <Button asChild variant="outline" disabled={isLoading} className="h-auto gap-2 rounded-xl py-[14px] text-[15px]">
          <label>
            <ImageIcon className="size-5" aria-hidden="true" />
            {t("spine.capture.gallery")}
            <input
              type="file"
              accept="image/*"
              disabled={isLoading}
              className="sr-only"
              onChange={(event) => {
                onPickFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
          </label>
        </Button>
      </div>

      {isLoading && (
        <p role="status" className="text-center text-[13px] text-muted-foreground">
          {t("spine.capture.loading")}
        </p>
      )}

      {hasPhoto && (
        <Button
          variant="ghost"
          onClick={onRemove}
          className="h-auto w-full rounded-xl py-3 text-[15px] font-medium text-destructive hover:text-destructive"
        >
          {t("spine.remove.action")}
        </Button>
      )}
    </div>
  );
}
