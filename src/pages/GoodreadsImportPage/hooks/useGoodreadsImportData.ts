import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import { useAuth } from "@/hooks/useAuth";
import { listLibrary } from "@/api/library";
import { supabase } from "@/lib/supabase";
import { invalidateProgressQueries } from "@/lib/progressQueries";

export type ImportStep = "upload" | "preview" | "importing" | "done" | "error";

export interface ImportPreview {
  total: number;
  read: number;
  reading: number;
  to_read: number;
  duplicates: number;
  rows: Papa.ParseResult<Record<string, string>>["data"];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: { title: string; reason: string }[];
}

export function useGoodreadsImportData() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<ImportStep>("upload");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: library = [] } = useQuery({
    queryKey: ["library", user?.id],
    queryFn: () => listLibrary(),
    enabled: !!user,
  });

  const existingIsbns = useMemo(
    () =>
      new Set(
        library.map((item) => item.book.isbn13).filter(Boolean) as string[],
      ),
    [library],
  );
  const existingTitles = useMemo(
    () => new Set(library.map((item) => item.book.title.toLowerCase())),
    [library],
  );

  const selectFile = useCallback(
    (file: File) => {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;

          // Valida che sia un CSV di Goodreads
          const requiredColumns = [
            "Title",
            "Author",
            "Exclusive Shelf",
            "My Rating",
          ];
          const headers = Object.keys(rows[0] ?? {});
          const isValidGoodreads = requiredColumns.every((col) =>
            headers.includes(col),
          );

          if (!isValidGoodreads) {
            setError(t("import.invalidFile"));
            setStep("error");
            return;
          }

          let read = 0;
          let reading = 0;
          let to_read = 0;
          let duplicates = 0;

          for (const row of rows) {
            const shelf = row["Exclusive Shelf"] ?? "";
            const isbn = (row["ISBN13"] ?? "").replace(/[="]/g, "").trim();
            const title = (row["Title"] ?? "").toLowerCase();

            if (
              (isbn && existingIsbns.has(isbn)) ||
              (!isbn && existingTitles.has(title))
            ) {
              duplicates++;
              continue;
            }

            if (shelf === "read") read++;
            else if (shelf === "currently-reading") reading++;
            else to_read++;
          }

          setPreview({
            total: read + reading + to_read,
            read,
            reading,
            to_read,
            duplicates,
            rows,
          });
          setStep("preview");
        },
        error: () => {
          setError(t("import.fileError"));
          setStep("error");
        },
      });
    },
    [existingIsbns, existingTitles, t],
  );

  const confirmImport = useCallback(async () => {
    if (!preview) return;
    setStep("importing");

    const csv = Papa.unparse(preview.rows);
    const { data, error: fnError } =
      await supabase.functions.invoke<ImportResult>("import-goodreads", {
        body: { csv },
      });

    if (fnError || !data) {
      setError(fnError?.message ?? t("common.error"));
      setStep("error");
      return;
    }

    setResult(data);
    setStep("done");

    // L'import inserisce libri già letti: aggiorna libreria, statistiche e,
    // visto che il trigger sblocca badge anche all'insert, obiettivi e badge.
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["library", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["stats", user?.id] }),
      invalidateProgressQueries(queryClient, user?.id),
    ]);
  }, [preview, t, queryClient, user?.id]);

  const reset = useCallback(() => {
    setStep("upload");
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    data: { preview, result, error },
    ui: { step },
    actions: {
      goBack: () => navigate(-1),
      goToLibrary: () => navigate("/library"),
      selectFile,
      confirmImport,
      reset,
    },
  };
}
