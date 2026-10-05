import { Camera, ImageIcon, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Illustration } from "@/components/shared/Illustration";
import { Button } from "@/components/ui/button";

const TIP_KEYS = ["light", "straight", "close"] as const;

/** Prima tappa: illustrazione, consigli, scatto o galleria; con una foto già presente anche "Rimuovi". */
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
      {/* variante chiara e scura: Illustration sceglie quella del tema dell'app */}
      <div className="flex h-[168px] items-center justify-center rounded-2xl bg-accent/60">
        <Illustration name="spine-photo" className="size-[150px]" />
      </div>

      <ul className="space-y-3">
        {TIP_KEYS.map((key) => (
          <li key={key} className="flex gap-3 text-[14px] leading-snug text-foreground">
            <Lightbulb className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
            {t(`spine.capture.tips.${key}`)}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {/* fotocamera nativa: HDR e messa a fuoco di sistema, funziona anche nella PWA iOS */}
        <Button asChild disabled={isLoading} className="h-auto w-full gap-2 rounded-xl py-[14px] text-[15px]">
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
        <Button
          asChild
          variant="outline"
          disabled={isLoading}
          className="h-auto w-full gap-2 rounded-xl border-primary/40 py-[14px] text-[15px] text-foreground"
        >
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
