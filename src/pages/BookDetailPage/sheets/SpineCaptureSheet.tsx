import { useTranslation } from "react-i18next";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import type { SpinePreset } from "@/lib/spine/config";
import type { LoadedPhoto, ProcessedSpine } from "@/lib/spine/engine";
import type { Quad } from "@/lib/spine/homography";
import type { SpineCaptureStep } from "../hooks/useSpineCapture";
import { SpineChooseStep } from "../components/SpineChooseStep";
import { SpineCropStep } from "../components/SpineCropStep";
import { SpineReviewStep } from "../components/SpineReviewStep";

/** Foto della costola: scelta → 4 angoli → preset e salvataggio. */
export function SpineCaptureSheet({
  open,
  step,
  hasPhoto,
  photo,
  quad,
  processed,
  preset,
  showBlurWarning,
  isLoadingPhoto,
  isProcessing,
  isSaving,
  onClose,
  onPickFile,
  onQuadChange,
  onProcess,
  onPresetChange,
  onAcceptBlur,
  onRetake,
  onBackToCrop,
  onSave,
  onRemove,
}: {
  open: boolean;
  step: SpineCaptureStep;
  hasPhoto: boolean;
  photo: LoadedPhoto | null;
  quad: Quad | null;
  processed: ProcessedSpine | null;
  preset: SpinePreset;
  showBlurWarning: boolean;
  isLoadingPhoto: boolean;
  isProcessing: boolean;
  isSaving: boolean;
  onClose: () => void;
  onPickFile: (file: File | null) => void;
  onQuadChange: (quad: Quad) => void;
  onProcess: () => void;
  onPresetChange: (preset: SpinePreset) => void;
  onAcceptBlur: () => void;
  onRetake: () => void;
  onBackToCrop: () => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const title =
    step === "crop"
      ? t("spine.capture.cropTitle")
      : step === "review"
        ? t("spine.capture.reviewTitle")
        : hasPhoto
          ? t("spine.capture.replaceTitle")
          : t("spine.capture.addTitle");

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent className="gap-0 overflow-y-auto px-5 pb-6 data-[side=bottom]:max-h-[92svh]">
        <SheetTitle className="pb-4 pr-8 text-[20px] font-bold text-foreground">{title}</SheetTitle>

        {step === "choose" && (
          <SpineChooseStep
            hasPhoto={hasPhoto}
            isLoading={isLoadingPhoto}
            onPickFile={onPickFile}
            onRemove={onRemove}
          />
        )}

        {step === "crop" && photo && quad && (
          <SpineCropStep
            photo={photo}
            quad={quad}
            isProcessing={isProcessing}
            onQuadChange={onQuadChange}
            onRetake={onRetake}
            onNext={onProcess}
          />
        )}

        {step === "review" && processed && (
          <SpineReviewStep
            processed={processed}
            preset={preset}
            showBlurWarning={showBlurWarning}
            isSaving={isSaving}
            onPresetChange={onPresetChange}
            onAcceptBlur={onAcceptBlur}
            onRetake={onRetake}
            onBackToCrop={onBackToCrop}
            onSave={onSave}
          />
        )}
      </BottomSheetContent>
    </Sheet>
  );
}
