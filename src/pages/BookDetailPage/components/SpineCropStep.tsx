import { RotateCcw, RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SpineCropper } from "@/components/shared/SpineCropper";
import { Button } from "@/components/ui/button";
import { SheetTitle } from "@/components/ui/sheet";
import type { LoadedPhoto } from "@/lib/spine/engine";
import type { Quad } from "@/lib/spine/homography";

/**
 * Seconda tappa: i 4 angoli sui bordi del dorso, con rotazione di 90° della foto.
 * Ha una sua barra in alto (Annulla · titolo · Avanti) al posto della X dello sheet.
 */
export function SpineCropStep({
  photo,
  quad,
  isBusy,
  isProcessing,
  onQuadChange,
  onRotateLeft,
  onRotateRight,
  onCancel,
  onNext,
}: {
  photo: LoadedPhoto;
  quad: Quad;
  isBusy: boolean;
  isProcessing: boolean;
  onQuadChange: (quad: Quad) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onCancel: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Button
          variant="link"
          onClick={onCancel}
          disabled={isProcessing}
          className="h-auto justify-self-start p-0 text-[15px] font-medium text-primary"
        >
          {t("common.cancel")}
        </Button>
        <SheetTitle className="text-center text-[18px] font-bold text-foreground">
          {t("spine.capture.cropTitle")}
        </SheetTitle>
        <Button
          variant="link"
          onClick={onNext}
          disabled={isBusy}
          className="h-auto justify-self-end p-0 text-[15px] font-medium text-primary"
        >
          {isProcessing ? t("spine.capture.processing") : t("spine.capture.next")}
        </Button>
      </div>

      <p className="text-center text-[14px] text-muted-foreground">{t("spine.capture.cropSubtitle")}</p>

      {/* fondo scuro dietro la foto, come una camera oscura */}
      <div className="-mx-5 bg-neutral-700 py-3">
        <SpineCropper
          image={photo.preview}
          imageWidth={photo.width}
          imageHeight={photo.height}
          quad={quad}
          maxHeight={Math.round(window.innerHeight * 0.5)}
          onChange={onQuadChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Button
          variant="ghost"
          onClick={onRotateLeft}
          disabled={isBusy}
          className="h-auto flex-col gap-1.5 py-2 text-[13px] font-normal text-muted-foreground"
        >
          <RotateCcw className="size-5 text-foreground" aria-hidden="true" />
          {t("spine.capture.rotateLeft")}
        </Button>
        <Button
          variant="ghost"
          onClick={onRotateRight}
          disabled={isBusy}
          className="h-auto flex-col gap-1.5 py-2 text-[13px] font-normal text-muted-foreground"
        >
          <RotateCw className="size-5 text-foreground" aria-hidden="true" />
          {t("spine.capture.rotateRight")}
        </Button>
      </div>
    </div>
  );
}
