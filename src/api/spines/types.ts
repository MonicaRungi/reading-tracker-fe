import type { LibraryItemRow } from "@/types/database.types"

/** Formati accettati dal bucket `spines` (la pipeline produce WebP, o JPEG se Safari non sa fare WebP). */
export type SpineImageType = "image/webp" | "image/jpeg"

export interface UploadSpineInput {
  userId: string
  libraryItemId: string
  blob: Blob
  type: SpineImageType
  /** larghezza / altezza della costola elaborata. */
  ratio: number
  /** Foto precedente da eliminare dopo la sostituzione (null se è la prima). */
  previousPath: string | null
}

export type SpineFields = Pick<LibraryItemRow, "spine_path" | "spine_ratio">

/** URL firmati, per path: un path senza URL (file mancante) semplicemente non c'è. */
export type SpineUrls = Record<string, string>
