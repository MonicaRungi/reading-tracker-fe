import { SPINE_PIPELINE } from "./config";
import { canvasToBlob, context2d, createCanvas } from "./canvas";

export interface EncodedSpine {
  blob: Blob;
  /** Tipo effettivamente prodotto: Safari può ignorare la richiesta di WebP. */
  type: "image/webp" | "image/jpeg";
  quality: number;
}

const ACCEPTED = ["image/webp", "image/jpeg"] as const;

/**
 * Comprime la costola per il bucket: WebP se il browser lo produce davvero,
 * altrimenti JPEG; se supera il limite riduce la qualità e riprova.
 */
export async function encodeSpine(image: ImageData): Promise<EncodedSpine> {
  const canvas = createCanvas(image.width, image.height);
  context2d(canvas).putImageData(image, 0, 0);

  let type: EncodedSpine["type"] = "image/webp";
  for (
    let quality: number = SPINE_PIPELINE.quality;
    quality >= SPINE_PIPELINE.minQuality - 1e-9;
    quality -= SPINE_PIPELINE.qualityStep
  ) {
    let blob = await canvasToBlob(canvas, type, quality);
    if (!(ACCEPTED as readonly string[]).includes(blob.type)) {
      type = "image/jpeg";
      blob = await canvasToBlob(canvas, type, quality);
    } else {
      type = blob.type as EncodedSpine["type"];
    }
    if (blob.size <= SPINE_PIPELINE.maxBytes) {
      return { blob, type, quality: Math.round(quality * 100) / 100 };
    }
  }
  throw new Error("encodeSpine: immagine troppo pesante anche alla qualità minima");
}
