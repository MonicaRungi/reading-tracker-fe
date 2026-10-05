import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LibraryItem } from "@/api/library";
import { removeSpine, uploadSpine } from "@/api/spines";
import { useAuth } from "@/hooks/useAuth";
import { useSpineUrls } from "@/hooks/useSpineUrls";
import { DEFAULT_SPINE_PRESET, SPINE_PRESETS } from "@/lib/spine/config";
import type { SpinePreset } from "@/lib/spine/config";
import { defaultSpineQuad } from "@/lib/spine/defaultQuad";
import type { LoadedPhoto, ProcessedSpine } from "@/lib/spine/engine";
import type { Quad } from "@/lib/spine/homography";
import type { RotationDirection } from "@/lib/spine/rotate";
import { createSpineProcessor } from "@/lib/spine/process";
import type { SpineProcessor } from "@/lib/spine/process";

export type SpineCaptureStep = "choose" | "crop" | "review";

/**
 * Foto del dorso dal dettaglio libro: scatto o galleria → 4 angoli →
 * confronto dei preset (con avviso di sfocatura) → compressione e upload.
 * La pipeline gira in un worker creato all'apertura dello sheet e chiuso alla
 * chiusura: la foto originale resta nel telefono, si carica solo il risultato.
 */
export function useSpineCapture(item: LibraryItem | undefined) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { urls, refresh: refreshUrls } = useSpineUrls([item?.spine_path]);
  const spineUrl = item?.spine_path ? (urls[item.spine_path] ?? null) : null;

  // promise: la foto può essere scelta prima che il worker sia pronto
  const processorRef = useRef<Promise<SpineProcessor> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<SpineCaptureStep>("choose");
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [quad, setQuad] = useState<Quad | null>(null);
  const [processed, setProcessed] = useState<ProcessedSpine | null>(null);
  const [preset, setPreset] = useState<SpinePreset>(DEFAULT_SPINE_PRESET);
  const [blurAccepted, setBlurAccepted] = useState(false);
  const [busy, setBusy] = useState<"loading" | "processing" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // worker solo mentre lo sheet è aperto
  useEffect(() => {
    if (!isOpen) return;
    const processor = createSpineProcessor();
    processorRef.current = processor;
    return () => {
      processorRef.current = null;
      void processor.then((p) => p.dispose());
    };
  }, [isOpen]);

  function resetCapture() {
    setStep("choose");
    setPhoto((current) => {
      current?.preview.close();
      return null;
    });
    setQuad(null);
    setProcessed(null);
    setPreset(DEFAULT_SPINE_PRESET);
    setBlurAccepted(false);
    setBusy(null);
  }

  async function invalidateSpine() {
    await Promise.all(
      ["library", "shelf", "shelves", "spine-urls"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key, userId] }),
      ),
    );
  }

  const save = useMutation({
    mutationFn: async () => {
      const processor = await processorRef.current;
      if (!processor || !processed || !item || !userId) throw new Error("spine: stato non valido");
      const encoded = await processor.encode(preset);
      return uploadSpine({
        userId,
        libraryItemId: item.id,
        blob: encoded.blob,
        type: encoded.type,
        ratio: processed.ratio,
        previousPath: item.spine_path,
      });
    },
    onSuccess: async () => {
      await invalidateSpine();
      toast.success(t("spine.toast.saved"));
      setIsOpen(false);
      resetCapture();
    },
    onError: () => toast.error(t("spine.toast.saveError")),
  });

  const remove = useMutation({
    mutationFn: () => removeSpine(item!.id, item!.spine_path!),
    onSuccess: async () => {
      await invalidateSpine();
      toast.success(t("spine.toast.removed"));
      setConfirmRemove(false);
      setIsOpen(false);
    },
    onError: () => toast.error(t("common.error")),
  });

  async function pickFile(file: File | null) {
    if (!file || !processorRef.current) return;
    setBusy("loading");
    try {
      const processor = await processorRef.current;
      const loaded = await processor.load(file);
      setPhoto((current) => {
        current?.preview.close();
        return loaded;
      });
      setQuad(defaultSpineQuad(loaded.width, loaded.height));
      setStep("crop");
    } catch {
      toast.error(t("spine.toast.loadError"));
    } finally {
      setBusy(null);
    }
  }

  // "Ruota a sinistra/destra": la foto ruota di 90° e gli angoli tornano al rettangolo iniziale
  async function rotate(direction: RotationDirection) {
    if (!processorRef.current) return;
    setBusy("loading");
    try {
      const processor = await processorRef.current;
      const rotated = await processor.rotate(direction);
      setPhoto((current) => {
        current?.preview.close();
        return rotated;
      });
      setQuad(defaultSpineQuad(rotated.width, rotated.height));
    } catch {
      toast.error(t("spine.toast.loadError"));
    } finally {
      setBusy(null);
    }
  }

  async function processCrop() {
    if (!processorRef.current || !quad) return;
    setBusy("processing");
    try {
      const processor = await processorRef.current;
      const result = await processor.process(quad, SPINE_PRESETS);
      setProcessed(result);
      setPreset(DEFAULT_SPINE_PRESET);
      setBlurAccepted(false);
      setStep("review");
    } catch {
      toast.error(t("spine.toast.processError"));
    } finally {
      setBusy(null);
    }
  }

  return {
    data: {
      spineUrl,
      hasPhoto: Boolean(item?.spine_path),
      photo,
      quad,
      processed,
    },
    ui: {
      isOpen,
      step,
      preset,
      // l'avviso di sfocatura blocca il salvataggio finché non si sceglie "Usa comunque"
      showBlurWarning: Boolean(processed?.isBlurry) && !blurAccepted,
      isLoadingPhoto: busy === "loading",
      isProcessing: busy === "processing",
      isSaving: save.isPending,
      confirmRemove,
      isRemoving: remove.isPending,
    },
    actions: {
      open: () => {
        resetCapture();
        setIsOpen(true);
      },
      close: () => {
        if (save.isPending) return;
        setIsOpen(false);
        resetCapture();
      },
      pickFile,
      setQuad,
      rotateLeft: () => void rotate(-1),
      rotateRight: () => void rotate(1),
      processCrop,
      setPreset,
      acceptBlur: () => setBlurAccepted(true),
      // "Annulla" nel ritaglio e "Rifai" dopo l'avviso di sfocatura: si torna alla scelta della foto
      retake: resetCapture,
      save: () => save.mutate(),
      askRemove: () => setConfirmRemove(true),
      setConfirmRemove: (open: boolean) => !remove.isPending && setConfirmRemove(open),
      confirmRemove: () => remove.mutate(),
      refreshUrls,
    },
  };
}
