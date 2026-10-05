import { useTranslation } from "react-i18next";
import { SpineCropper } from "@/components/shared/SpineCropper";
import { Button } from "@/components/ui/button";
import { useDevSpineData } from "./hooks/useDevSpineData";
import { PresetResult } from "./components/PresetResult";
import { TimingsList } from "./components/TimingsList";

/** Pagina di prova della pipeline del dorso: esiste solo in sviluppo (vedi App.tsx). */
export default function DevSpinePage() {
  const { t } = useTranslation();
  const { data, ui, actions } = useDevSpineData();

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <div>
        <h1 className="text-[22px] font-bold text-foreground">{t("dev.spine.title")}</h1>
        <p className="text-[13px] text-muted-foreground">
          {data.mode ? t("dev.spine.mode", { mode: data.mode }) : t("common.loading")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild disabled={!data.mode || ui.busy !== null}>
          <label>
            {t("dev.spine.camera")}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={!data.mode || ui.busy !== null}
              onChange={(e) => void actions.pickFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </Button>
        <Button asChild variant="outline" disabled={!data.mode || ui.busy !== null}>
          <label>
            {t("dev.spine.gallery")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={!data.mode || ui.busy !== null}
              onChange={(e) => void actions.pickFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </Button>
      </div>

      {data.error && <p className="text-[13px] text-destructive">{data.error}</p>}
      {ui.busy === "loading" && <p className="text-[13px] text-muted-foreground">{t("common.loading")}</p>}

      {data.photo && data.quad && data.file && (
        <>
          <p className="text-[13px] text-muted-foreground">
            {t("dev.spine.photoInfo", {
              name: data.file.name,
              mb: Math.round(data.file.size / 104857.6) / 10,
              ow: data.photo.originalWidth,
              oh: data.photo.originalHeight,
              w: data.photo.width,
              h: data.photo.height,
            })}
          </p>
          <p className="text-[13px] text-foreground">{t("dev.spine.cornersHint")}</p>
          <SpineCropper
            image={data.photo.preview}
            imageWidth={data.photo.width}
            imageHeight={data.photo.height}
            quad={data.quad}
            maxHeight={520}
            onChange={actions.setQuad}
          />
          <Button onClick={() => void actions.process()} disabled={ui.busy !== null} className="w-full">
            {ui.busy === "processing" ? t("dev.spine.processing") : t("dev.spine.process")}
          </Button>
          <TimingsList title={t("dev.spine.loadTimings")} timings={data.photo.timings} />
        </>
      )}

      {data.processed && (
        <>
          <p className="text-[13px] text-foreground">
            {t("dev.spine.result", {
              w: data.processed.width,
              h: data.processed.height,
              ratio: data.processed.ratio.toFixed(4),
            })}
            {" · "}
            {t("dev.spine.blur", {
              score: data.processed.blurScore,
              threshold: data.blurThreshold,
              verdict: data.processed.isBlurry ? t("dev.spine.blurry") : t("dev.spine.sharp"),
            })}
          </p>
          <div className="flex justify-center gap-6 overflow-x-auto pb-2">
            {data.processed.results.map(({ preset, image }) => (
              <PresetResult
                key={preset}
                preset={preset}
                image={image}
                encoded={data.encoded[preset]}
                isEncoding={ui.busy === preset}
                onEncode={() => void actions.encode(preset)}
              />
            ))}
          </div>
          <TimingsList title={t("dev.spine.processTimings")} timings={data.processed.timings} />
        </>
      )}
    </div>
  );
}
