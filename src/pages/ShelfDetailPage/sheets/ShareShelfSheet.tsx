import { Download, Share } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";

/**
 * Anteprima dell'immagine dello scaffale e azioni: "Condividi" (foglio di
 * condivisione del telefono) dove c'è, altrimenti "Salva l'immagine".
 */
export function ShareShelfSheet({
  open,
  shelfName,
  status,
  previewUrl,
  canShare,
  onShare,
  onDownload,
  onRetry,
  onClose,
}: {
  open: boolean;
  shelfName: string;
  status: "loading" | "ready" | "error";
  previewUrl: string | null;
  canShare: boolean;
  onShare: () => void;
  onDownload: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent className="flex flex-col gap-0 px-5">
        <SheetTitle className="pr-8 text-[20px] font-bold text-foreground">{t("shelves.share.title")}</SheetTitle>
        <SheetDescription className="mt-1 text-[14px] text-muted-foreground">
          {t("shelves.share.subtitle")}
        </SheetDescription>

        <div className="mt-4 flex min-h-48 items-center justify-center overflow-hidden rounded-2xl bg-secondary">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-10 text-[14px] text-muted-foreground">
              <LoadingSpinner />
              {t("shelves.share.preparing")}
            </div>
          )}
          {status === "error" && (
            <EmptyState
              size="inline"
              title={t("shelves.share.error")}
              action={{ label: t("common.retry"), onClick: onRetry }}
            />
          )}
          {status === "ready" && previewUrl && (
            <img
              src={previewUrl}
              alt={t("shelves.share.previewAlt", { name: shelfName })}
              className="max-h-[55svh] w-auto object-contain"
            />
          )}
        </div>

        <div className="pb-5 pt-4">
          <Button
            onClick={canShare ? onShare : onDownload}
            disabled={status !== "ready"}
            className="h-auto w-full gap-2 rounded-xl py-[14px] text-[15px] font-medium disabled:opacity-60"
          >
            {canShare ? <Share className="size-4" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
            {canShare ? t("shelves.share.share") : t("shelves.share.download")}
          </Button>
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
