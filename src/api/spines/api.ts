import { supabase } from "@/lib/supabase"
import type { SpineFields, SpineImageType, SpineUrls, UploadSpineInput } from "./types"

const BUCKET = "spines"

/** Durata degli URL firmati: la cache lato client (useSpineUrls) li rinnova prima. */
export const SPINE_URL_TTL_SECONDS = 60 * 60

const EXTENSIONS: Record<SpineImageType, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
}

/**
 * {user_id}/{library_item_id}-{timestamp}.{ext}: la cartella è quella che le
 * policy dello storage consentono all'utente; il timestamp rende l'URL nuovo a
 * ogni sostituzione (niente immagini vecchie dalla cache).
 */
function spinePath(userId: string, libraryItemId: string, type: SpineImageType): string {
  return `${userId}/${libraryItemId}-${Date.now()}.${EXTENSIONS[type]}`
}

/** Il file è secondario rispetto al DB: se non si cancella, ci pensa la pulizia notturna. */
async function removeFileQuietly(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined)
}

async function updateSpineFields(libraryItemId: string, fields: SpineFields): Promise<void> {
  const { error } = await supabase
    .from("library_items")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", libraryItemId)
    // .single(): se la riga non esiste (o la RLS la nasconde) è un errore, non 0 righe silenziose
    .select("id")
    .single()
  if (error) throw error
}

/**
 * Carica la costola elaborata e la collega al libro: upload → spine_path e
 * spine_ratio su library_items → eliminazione della foto precedente. Se
 * l'aggiornamento del DB fallisce, il file appena caricato viene rimosso.
 */
export async function uploadSpine({
  userId,
  libraryItemId,
  blob,
  type,
  ratio,
  previousPath,
}: UploadSpineInput): Promise<SpineFields> {
  const path = spinePath(userId, libraryItemId, type)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: type, upsert: false })
  if (uploadError) throw uploadError

  // numeric(6,4) nel DB
  const fields: SpineFields = { spine_path: path, spine_ratio: Math.round(ratio * 10_000) / 10_000 }
  try {
    await updateSpineFields(libraryItemId, fields)
  } catch (error) {
    await removeFileQuietly(path)
    throw error
  }

  if (previousPath && previousPath !== path) await removeFileQuietly(previousPath)
  return fields
}

/** Toglie la foto della costola: prima il DB (torna la costola generata), poi il file. */
export async function removeSpine(libraryItemId: string, path: string): Promise<void> {
  await updateSpineFields(libraryItemId, { spine_path: null, spine_ratio: null })
  await removeFileQuietly(path)
}

/** Per l'eliminazione di un libro: il file va via prima della riga che lo referenzia. */
export async function removeSpineFile(path: string): Promise<void> {
  await removeFileQuietly(path)
}

/** URL firmati in un'unica richiesta per tutte le costole con foto da mostrare. */
export async function getSpineUrls(paths: string[]): Promise<SpineUrls> {
  if (paths.length === 0) return {}
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SPINE_URL_TTL_SECONDS)
  if (error) throw error
  const urls: SpineUrls = {}
  for (const item of data ?? []) {
    if (item.path && item.signedUrl && !item.error) urls[item.path] = item.signedUrl
  }
  return urls
}
