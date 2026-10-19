import { supabase } from "@/lib/supabase";
import type { ImportResult } from "./types";

/** Invia il CSV Goodreads (già validato in anteprima) alla Edge Function. */
export async function importGoodreads(csv: string): Promise<ImportResult> {
  const { data, error } = await supabase.functions.invoke<ImportResult>(
    "import-goodreads",
    { body: { csv } },
  );
  if (error) throw error;
  if (!data) throw new Error("Risposta vuota da import-goodreads");
  return data;
}
