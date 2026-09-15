import { useEffect, useRef, useState, useCallback } from "react";
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
  NotFoundException,
} from "@zxing/library";
import { Zap, ZapOff, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// L'ISBN sul retro dei libri è sempre codificato come EAN-13: limitare i formati
// evita a zxing di provare ~20 decoder diversi (QR, DataMatrix, Code128, ecc.) ad
// ogni scansione, che sul thread principale causava lag percepibile nel browser.
const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
]);

interface BarcodeScannerProps {
  onDetected: (isbn: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const detectedRef = useRef(false); // evita chiamate multiple
  const [torch, setTorch] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);

  // onDetected cambia identità ad ogni render del chiamante: tenerlo in un ref
  // evita che startScan cambi identità di conseguenza e faccia ripartire lo
  // stream video ad ogni render (causava flicker nero).
  const onDetectedRef = useRef(onDetected);
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const startScan = useCallback(() => {
    detectedRef.current = false;

    const reader = new BrowserMultiFormatReader(HINTS);
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
        if (result && !detectedRef.current) {
          const text = result.getText();
          if (/^\d{13}$/.test(text)) {
            detectedRef.current = true; // blocca ulteriori rilevamenti
            reader.reset(); // ferma lo scan
            setDetectedIsbn(text);
            onDetectedRef.current(text); // UNA sola chiamata API
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          // errori di decodifica normali, ignora
        }
      })
      .catch((err: Error) => {
        if (err.name === "NotAllowedError") {
          setPermissionDenied(true);
        }
      });
  }, []);

  useEffect(() => {
    // zxing 0.23 logga NotFoundException/ChecksumException via console.warn ad ogni frame
    // senza barcode leggibile (bug noto: quelle exception non estendono ReaderException,
    // quindi il suo controllo `instanceof` interno non le filtra). Silenziamo solo quel
    // messaggio mentre lo scanner è montato.
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].startsWith("MultiFormatReader: non-ReaderException")
      ) {
        return;
      }
      originalWarn(...args);
    };

    startScan();

    return () => {
      readerRef.current?.reset();
      console.warn = originalWarn;
    };
  }, [startScan]);

  function retry() {
    readerRef.current?.reset();
    setPermissionDenied(false);
    setDetectedIsbn(null);
    startScan();
  }

  async function toggleTorch() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        // @ts-expect-error torch non è nel tipo standard
        advanced: [{ torch: !torch }],
      });
      setTorch((t) => !t);
    } catch {
      // torch non supportato
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
        autoPlay
      />

      {/* Mirino */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-48 w-64">
          {[
            "top-0 left-0 border-t-2 border-l-2",
            "top-0 right-0 border-t-2 border-r-2",
            "bottom-0 left-0 border-b-2 border-l-2",
            "bottom-0 right-0 border-b-2 border-r-2",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute h-8 w-8 border-[#E0644A] ${cls}`}
            />
          ))}

          {/* Scan line — visibile solo se non ancora rilevato */}
          {!detectedIsbn && (
            <div className="absolute inset-x-0 animate-scan">
              <div className="h-0.5 w-full bg-[#E0644A] shadow-[0_0_8px_#E0644A]" />
            </div>
          )}
        </div>
      </div>

      {/* Overlay ISBN rilevato */}
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 text-center">
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
