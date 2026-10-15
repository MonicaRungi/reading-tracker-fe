import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ShelfDetail, ShelfEntry } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { renderShelfImage } from "@/lib/shelfExport/render";
import { shelfRowInset } from "@/lib/shelfLayout";

type ExportStatus = "loading" | "ready" | "error";

interface ExportedImage {
  file: File;
  url: string;
  canShare: boolean;
}

function fileNameOf(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accenti staccati da normalize
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "scaffale"}.png`;
}

/**
 * Larghezza utile delle righe nella mensola a schermo, come la calcola
 * ShelfBoard (larghezza interna meno il margine delle righe): l'immagine va a
 * capo negli stessi punti. undefined se la mensola non è nella pagina.
 */
function measureRowWidth(): number | undefined {
  const board = document.querySelector<HTMLElement>("[data-shelf-board]");
  if (!board) return undefined;
  const style = getComputedStyle(board);
  const inner = board.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const width = inner - 2 * shelfRowInset();
  return width > 0 ? width : undefined;
}

/**
 * "Condividi lo scaffale": prepara l'immagine all'apertura dello sheet e la
 * mostra in anteprima; la condivisione parte da un secondo tocco, perché
 * Safari apre il foglio di condivisione solo subito dopo un gesto dell'utente.
 */
export function useShelfExport({
  shelf,
  items,
  bookCount,
  spineUrls,
}: {
  shelf: ShelfDetail | null;
  items: ShelfEntry[];
  bookCount: number;
  spineUrls: SpineUrls;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ExportStatus>("loading");
  const [image, setImage] = useState<ExportedImage | null>(null);
  // un'esportazione superata (sheet chiuso o riaperto) non deve sovrascrivere la nuova
  const runRef = useRef(0);
  const imageRef = useRef<ExportedImage | null>(null);

  function replaceImage(next: ExportedImage | null) {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
    imageRef.current = next;
    setImage(next);
  }

  useEffect(() => () => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
  }, []);

  async function open() {
    if (!shelf) return;
    const run = ++runRef.current;
    replaceImage(null);
    setStatus("loading");
    setIsOpen(true);
    try {
      const blob = await renderShelfImage({
        title: shelf.name,
        subtitle: t("library.bookCount", { count: bookCount }),
        footer: t("shelves.share.footer"),
        theme: shelf.color_theme,
        items,
        spineUrls,
        rowWidth: measureRowWidth(),
      });
      if (run !== runRef.current) return;
      const file = new File([blob], fileNameOf(shelf.name), { type: "image/png" });
      replaceImage({
        file,
        url: URL.createObjectURL(blob),
        canShare: typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }),
      });
      setStatus("ready");
    } catch {
      if (run === runRef.current) setStatus("error");
    }
  }

  async function share() {
    if (!image || !shelf) return;
    try {
      await navigator.share({ files: [image.file], title: shelf.name });
    } catch (error) {
      // chiuso dall'utente: non è un errore
      if ((error as Error).name !== "AbortError") toast.error(t("shelves.share.shareError"));
    }
  }

  function download() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.file.name;
    link.click();
  }

  return {
    ui: {
      isOpen,
      status,
      previewUrl: image?.url ?? null,
      canShare: image?.canShare ?? false,
    },
    actions: {
      open,
      close: () => {
        runRef.current++;
        setIsOpen(false);
        replaceImage(null);
      },
      retry: open,
      share,
      download,
    },
  };
}
