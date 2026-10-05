import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageDataCanvas } from "@/components/shared/ImageDataCanvas";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SpinePreset } from "@/lib/spine/config";
import type { ProcessedSpine } from "@/lib/spine/engine";

const PREVIEW_HEIGHT = 240;

/** Terza tappa: i tre preset affiancati, l'avviso di sfocatura e il salvataggio. */
export function SpineReviewStep({
  processed,
  preset,
  showBlurWarning,
  isSaving,
  onPresetChange,
  onAcceptBlur,
  onRetake,
  onBackToCrop,
  onSave,
}: {
  processed: ProcessedSpine;
  preset: SpinePreset;
  showBlurWarning: boolean;
  isSaving: boolean;
  onPresetChange: (preset: SpinePreset) => void;
  onAcceptBlur: () => void;
  onRetake: () => void;
  onBackToCrop: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={preset}
        onValueChange={(next) => next && onPresetChange(next as SpinePreset)}
        aria-label={t("spine.capture.presetsLabel")}
        className="grid w-full grid-cols-3 gap-2"
      >
        {processed.results.map(({ preset: key, image }) => (
          <ToggleGroupItem
            key={key}
            value={key}
            disabled={isSaving}
            className="flex h-auto flex-col gap-2 rounded-2xl border border-border p-2 text-[13px] font-medium text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-primary data-[state=on]:ring-1 data-[state=on]:ring-primary"
          >
            <ImageDataCanvas image={image} height={PREVIEW_HEIGHT} label={t(`spine.presets.${key}`)} />
            {t(`spine.presets.${key}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {showBlurWarning ? (
        <div role="alert" className="space-y-3 rounded-2xl bg-accent p-4">
          <p className="flex gap-2 text-[14px] text-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {t("spine.capture.blurWarning")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onRetake} className="h-auto rounded-xl py-3 text-[14px]">
              {t("spine.capture.retake")}
            </Button>
            <Button variant="outline" onClick={onAcceptBlur} className="h-auto rounded-xl py-3 text-[14px]">
              {t("spine.capture.useAnyway")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="h-auto w-full rounded-xl py-[14px] text-[15px] font-medium disabled:opacity-60"
        >
          {isSaving ? t("spine.capture.saving") : t("spine.capture.save")}
        </Button>
      )}

      <Button
        variant="link"
        onClick={onBackToCrop}
        disabled={isSaving}
        className="h-auto w-full p-0 text-[14px] text-muted-foreground"
      >
        {t("spine.capture.adjustCorners")}
      </Button>
    </div>
  );
}
