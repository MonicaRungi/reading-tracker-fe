import { useEffect, useRef, useState } from "react";

import {
  BrowserMultiFormatOneDReader,
  type IScannerControls,
} from "@zxing/browser";

import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import { CheckCircle, Zap, ZapOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
]);

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const { t } = useTranslation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const detectedRef = useRef(false);

  const onDetectedRef = useRef(onDetected);

  const [torch, setTorch] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);

  // Cambiando questa chiave riavviamo completamente lo scanner.
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (permissionDenied) {
      return;
    }

    let cancelled = false;
    let localControls: IScannerControls | null = null;

    const timeoutId = window.setTimeout(() => {
      const video = videoRef.current;

      if (!video || cancelled) {
        return;
      }

      detectedRef.current = false;

      const reader = new BrowserMultiFormatOneDReader(HINTS, {
        delayBetweenScanAttempts: 150,
        delayBetweenScanSuccess: 500,
      });

      void reader
        .decodeFromVideoDevice(undefined, video, (result, error, controls) => {
          if (cancelled) {
            void controls.stop();
            return;
          }

          if (result && !detectedRef.current) {
            const text = result.getText();

            if (/^\d{13}$/.test(text)) {
              detectedRef.current = true;

              void controls.stop();

              localControls = null;

              if (controlsRef.current === controls) {
                controlsRef.current = null;
              }

              setTorch(false);
              setDetectedIsbn(text);

              onDetectedRef.current(text);
              return;
            }
          }

          if (
            error &&
            error.name !== "NotFoundException" &&
            error.name !== "ChecksumException" &&
            error.name !== "FormatException"
          ) {
            console.error("Barcode decode error:", error);
          }
        })
        .then((controls) => {
          if (cancelled || detectedRef.current) {
            void controls.stop();
            return;
          }

          localControls = controls;
          controlsRef.current = controls;
        })
        .catch((error: unknown) => {
          if (cancelled) {
            return;
          }

          if (error instanceof Error) {
            // Se capita durante un cambio di stream/unmount non è
            // un errore reale per l'utente.
            if (error.name === "AbortError") {
              return;
            }

            if (
              error.name === "NotAllowedError" ||
              error.name === "PermissionDeniedError"
            ) {
              setPermissionDenied(true);
              return;
            }

            if (
              error.name === "NotReadableError" ||
              error.name === "TrackStartError"
            ) {
              setPermissionDenied(true);
              return;
            }
          }

          console.error("Errore durante l'avvio della fotocamera:", error);
        });
    }, 0);

    return () => {
      cancelled = true;

      window.clearTimeout(timeoutId);

      if (localControls) {
        void localControls.stop();
        localControls = null;
      }

      controlsRef.current = null;
    };
  }, [permissionDenied, scanKey]);

  function retry() {
    const controls = controlsRef.current;

    controlsRef.current = null;

    if (controls) {
      void controls.stop();
    }

    detectedRef.current = false;

    setTorch(false);
    setDetectedIsbn(null);
    setPermissionDenied(false);

    setScanKey((current) => current + 1);
  }

  async function toggleTorch() {
    const controls = controlsRef.current;

    if (!controls?.switchTorch) {
      return;
    }

    const nextTorch = !torch;

    try {
      await controls.switchTorch(nextTorch);
      setTorch(nextTorch);
    } catch {
      // Torcia non supportata dal browser/dispositivo.
    }
  }

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#F1EFEC] p-8 text-center">
        <p className="text-[15px] font-medium text-foreground">
          {t("search.cameraUnavailable")}
        </p>

        <p className="text-[13px] text-[#938C84]">
          {t("search.cameraUnavailableHint")}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="mt-1 rounded-full border border-[#E0644A] px-4 py-2 text-[13px] font-medium text-[#E0644A]"
        >
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-black"
      style={{ aspectRatio: "4/5" }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
      />

      {/* Mirino */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-48 w-64">
          {[
            "top-0 left-0 border-t-2 border-l-2",
            "top-0 right-0 border-t-2 border-r-2",
            "bottom-0 left-0 border-b-2 border-l-2",
            "bottom-0 right-0 border-b-2 border-r-2",
          ].map((className, index) => (
            <div
              key={index}
              className={`absolute h-8 w-8 border-[#E0644A] ${className}`}
            />
          ))}

          {!detectedIsbn && (
            <div className="absolute inset-x-0 animate-scan">
              <div className="h-0.5 w-full bg-[#E0644A] shadow-[0_0_8px_#E0644A]" />
            </div>
          )}
        </div>
      </div>

      {/* ISBN rilevato */}
      {detectedIsbn ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
          <CheckCircle className="size-12 text-[#E0644A]" />

          <p className="text-[13px] font-medium text-white">
            {t("search.scanDetected")}
          </p>

          <p className="font-mono text-[15px] font-bold text-white">
            {detectedIsbn}
          </p>

          <p className="text-[12px] text-white/70">
            {t("search.scanSearching")}
          </p>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 text-center">
          <p className="text-[15px] font-semibold text-white">
            {t("search.scanHint")}
          </p>

          <p className="mt-1 text-[12px] text-white/80">
            {t("search.scanHintSub")}
          </p>
        </div>
      )}

      {/* Torcia */}
      {!detectedIsbn && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTorch}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
          aria-label={torch ? t("search.torchOff") : t("search.torchOn")}
        >
          {torch ? <ZapOff className="size-5" /> : <Zap className="size-5" />}
        </Button>
      )}
    </div>
  );
}
