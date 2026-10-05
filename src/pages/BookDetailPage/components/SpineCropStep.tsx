import { useTranslation } from "react-i18next";
import { SpineCropper } from "@/components/shared/SpineCropper";
import { Button } from "@/components/ui/button";
import type { LoadedPhoto } from "@/lib/spine/engine";
import type { Quad } from "@/lib/spine/homography";

/** Seconda tappa: i 4 angoli sui bordi della costola. */
export function SpineCropStep({
  photo,
  quad,
  isProcessing,
  onQuadChange,
  onRetake,
  onNext,
}: {
  photo: LoadedPhoto;
  quad: Quad;
  isProcessing: boolean;
  onQuadChange: (quad: Quad) => void;
  onRetake: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-muted-foreground">{t("spine.capture.cropHint")}</p>
      <SpineCropper
        image={photo.preview}
        imageWidth={photo.width}
        imageHeight={photo.height}
        quad={quad}
        maxHeight={Math.round(window.innerHeight * 0.5)}
        onChange={onQuadChange}
      />
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onRetake}
          disabled={isProcessing}
          className="h-auto rounded-xl py-[14px] text-[15px]"
        >
          {t("spine.capture.retake")}
        </Button>
        <Button
          onClick={onNext}
          disabled={isProcessing}
          className="h-auto rounded-xl py-[14px] text-[15px] font-medium"
        >
          {isProcessing ? t("spine.capture.processing") : t("spine.capture.next")}
        </Button>
      </div>
    </div>
  );
}
