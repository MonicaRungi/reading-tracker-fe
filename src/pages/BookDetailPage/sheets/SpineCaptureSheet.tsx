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

/**
 * Foto del dorso: scelta → 4 angoli → resa e salvataggio. Il ritaglio ha la sua
 * barra (Annulla · titolo · Avanti) e niente X; le altre tappe hanno titolo e X.
 */
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
  onRotateLeft,
  onRotateRight,
  onProcess,
  onPresetChange,
  onAcceptBlur,
  onRetake,
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
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onProcess: () => void;
  onPresetChange: (preset: SpinePreset) => void;
  onAcceptBlur: () => void;
  onRetake: () => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent
        showCloseButton={step !== "crop"}
        className="gap-0 overflow-y-auto px-5 data-[side=bottom]:max-h-[92svh]"
      >
        {/* margine in basso su un contenitore interno: sul contenitore dello sheet
            verrebbe sostituito dal pb-safe di BottomSheetContent (0 fuori da iPhone) */}
        <div className="pb-8">
          {step === "choose" && (
            <>
              <SheetTitle className="pb-5 pr-8 text-[20px] font-bold text-foreground">
                {hasPhoto ? t("spine.capture.replaceTitle") : t("spine.capture.addTitle")}
              </SheetTitle>
              <SpineChooseStep
                hasPhoto={hasPhoto}
                isLoading={isLoadingPhoto}
                onPickFile={onPickFile}
                onRemove={onRemove}
              />
            </>
          )}

          {step === "crop" && photo && quad && (
            <SpineCropStep
              photo={photo}
              quad={quad}
              isBusy={isLoadingPhoto || isProcessing}
              isProcessing={isProcessing}
              onQuadChange={onQuadChange}
              onRotateLeft={onRotateLeft}
              onRotateRight={onRotateRight}
              onCancel={onRetake}
              onNext={onProcess}
            />
          )}

          {step === "review" && processed && (
            <>
              <SheetTitle className="px-8 pb-2 pt-2 text-center text-[20px] font-bold text-foreground">
                {t("spine.capture.reviewTitle")}
              </SheetTitle>
              <SpineReviewStep
                processed={processed}
                preset={preset}
                showBlurWarning={showBlurWarning}
                isSaving={isSaving}
                onPresetChange={onPresetChange}
                onAcceptBlur={onAcceptBlur}
                onRetake={onRetake}
                onSave={onSave}
              />
            </>
          )}
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
