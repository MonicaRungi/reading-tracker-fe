import { useEffect, useRef, useState } from "react";
import { SPINE_PIPELINE, SPINE_PRESETS } from "@/lib/spine/config";
import type { SpinePreset } from "@/lib/spine/config";
import { defaultSpineQuad } from "@/lib/spine/defaultQuad";
import type { EncodedResult, LoadedPhoto, ProcessedSpine } from "@/lib/spine/engine";
import type { Quad } from "@/lib/spine/homography";
import { createSpineProcessor } from "@/lib/spine/process";
import type { SpineProcessor } from "@/lib/spine/process";

export type EncodedPreview = EncodedResult & { url: string };

/**
 * Pagina di prova della pipeline (solo sviluppo): carica una foto, sposta i 4
 * angoli, elabora i tre preset e comprime, mostrando i tempi di ogni passaggio.
 */
export function useDevSpineData() {
  const processorRef = useRef<SpineProcessor | null>(null);
  // URL dei file compressi mostrati in pagina: si liberano a ogni nuova foto/elaborazione
  const objectUrlsRef = useRef<string[]>([]);
  const [mode, setMode] = useState<SpineProcessor["mode"] | null>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [quad, setQuad] = useState<Quad | null>(null);
  const [processed, setProcessed] = useState<ProcessedSpine | null>(null);
  const [encoded, setEncoded] = useState<Partial<Record<SpinePreset, EncodedPreview>>>({});
  const [busy, setBusy] = useState<"loading" | "processing" | SpinePreset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createSpineProcessor().then((processor) => {
      if (cancelled) return processor.dispose();
      processorRef.current = processor;
      setMode(processor.mode);
    });
    const objectUrls = objectUrlsRef.current;
    return () => {
      cancelled = true;
      processorRef.current?.dispose();
      processorRef.current = null;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function clearEncoded() {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.length = 0;
    setEncoded({});
  }

  async function run<T>(step: NonNullable<typeof busy>, task: (p: SpineProcessor) => Promise<T>) {
    const processor = processorRef.current;
    if (!processor) return;
    setBusy(step);
    setError(null);
    try {
      return await task(processor);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function pickFile(next: File | null) {
    if (!next) return;
    setFile({ name: next.name, size: next.size });
    setProcessed(null);
    clearEncoded();
    const loaded = await run("loading", (p) => p.load(next));
    if (!loaded) return;
    photo?.preview.close();
    setPhoto(loaded);
    setQuad(defaultSpineQuad(loaded.width, loaded.height));
  }

  async function process() {
    if (!quad) return;
    clearEncoded();
    const result = await run("processing", (p) => p.process(quad, SPINE_PRESETS));
    if (result) setProcessed(result);
  }

  async function encode(preset: SpinePreset) {
    const result = await run(preset, (p) => p.encode(preset));
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    objectUrlsRef.current.push(url);
    setEncoded((prev) => ({ ...prev, [preset]: { ...result, url } }));
  }

  return {
    data: {
      mode,
      file,
      photo,
      quad,
      processed,
      encoded,
      error,
      blurThreshold: SPINE_PIPELINE.blurThreshold,
    },
    ui: { busy },
    actions: { pickFile, setQuad, process, encode },
  };
}
