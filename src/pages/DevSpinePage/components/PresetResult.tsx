import { useTranslation } from "react-i18next";
import { ImageDataCanvas } from "@/components/shared/ImageDataCanvas";
import { Button } from "@/components/ui/button";
import type { SpinePreset } from "@/lib/spine/config";
import type { EncodedPreview } from "../hooks/useDevSpineData";

const RESULT_HEIGHT = 320;

/** Un preset elaborato: anteprima, compressione e (dopo) il file compresso reale. */
export function PresetResult({
  preset,
  image,
  encoded,
  isEncoding,
  onEncode,
}: {
  preset: SpinePreset;
  image: ImageData;
  encoded: EncodedPreview | undefined;
  isEncoding: boolean;
  onEncode: () => void;
}) {
  const { t } = useTranslation();
  const label = t(`spine.presets.${preset}`);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[13px] font-semibold text-foreground">{label}</p>
      <ImageDataCanvas image={image} height={RESULT_HEIGHT} label={label} />
      {encoded ? (
        <>
          {/* il file compresso, decodificato dal browser: è quello che finirebbe nel bucket */}
          <img src={encoded.url} alt="" style={{ height: RESULT_HEIGHT / 2 }} className="rounded-[3px]" />
          <p className="text-center font-mono text-[11px] text-muted-foreground">
            {t("dev.spine.encoded", {
              type: encoded.type,
              kb: Math.round(encoded.blob.size / 102.4) / 10,
              quality: encoded.quality,
              ms: encoded.timings.encode,
            })}
          </p>
          <a href={encoded.url} download={`dorso-${preset}`} className="text-[12px] text-primary underline">
            {t("dev.spine.download")}
          </a>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={onEncode} disabled={isEncoding}>
          {isEncoding ? t("common.loading") : t("dev.spine.encode")}
        </Button>
      )}
    </div>
  );
}
