import { fetchCoverBlob } from "@/api/books";

/**
 * Immagini per il canvas dell'esportazione. Tutto ciò che non è dell'app
 * passa da un Blob (fetch con CORS): un'immagine "sporca" bloccherebbe
 * l'esportazione del canvas. Gli object URL creati vanno liberati con `release`.
 */
export class ExportImages {
  private objectUrls: string[] = [];

  /** Immagine dell'app o data URL (stessa origine: niente CORS). */
  load(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  private async fromBlob(blob: Blob | null): Promise<HTMLImageElement | null> {
    if (!blob || !blob.type.startsWith("image/")) return null;
    const url = URL.createObjectURL(blob);
    this.objectUrls.push(url);
    return this.load(url);
  }

  /** Foto del dorso (URL firmato di Storage, che manda il CORS). */
  async spine(url: string): Promise<HTMLImageElement | null> {
    try {
      // no-store: la stessa immagine nella pagina è stata caricata senza CORS
      const res = await fetch(url, { mode: "cors", cache: "no-store" });
      return res.ok ? this.fromBlob(await res.blob()) : null;
    } catch {
      return null;
    }
  }

  /** Copertina (Google Books tramite cover-proxy, Open Library diretta). */
  async cover(url: string): Promise<HTMLImageElement | null> {
    return this.fromBlob(await fetchCoverBlob(url));
  }

  release() {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls = [];
  }
}
