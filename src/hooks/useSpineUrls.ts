import { useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpineUrls } from "@/api/spines";
import type { SpineUrls } from "@/api/spines";
import { useAuth } from "@/hooks/useAuth";

/** Sotto la scadenza degli URL firmati (1 h): si rinnovano prima che scadano. */
const SPINE_URLS_STALE_TIME = 50 * 60 * 1000;
const EMPTY_URLS: SpineUrls = {};
/**
 * Un'immagine che non si carica chiede nuovi URL: al massimo una volta al minuto,
 * altrimenti un file mancante (non solo un URL scaduto) rigenererebbe all'infinito.
 */
const MIN_REFRESH_INTERVAL_MS = 60 * 1000;

/**
 * URL firmati delle foto delle costole, in un'unica richiesta per l'insieme di
 * path dato (dettaglio libro, mensola, anteprime). `refresh` li rigenera, ad
 * esempio quando un'immagine non si carica (URL scaduto → 400/403), con un limite
 * di frequenza.
 */
export function useSpineUrls(paths: readonly (string | null | undefined)[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const sorted = useMemo(
    () => [...new Set(paths.filter((path): path is string => Boolean(path)))].sort(),
    [paths],
  );
  const queryKey = ["spine-urls", userId, ...sorted];
  const lastRefresh = useRef(0);

  const { data } = useQuery({
    queryKey,
    queryFn: () => getSpineUrls(sorted),
    enabled: Boolean(userId) && sorted.length > 0,
    staleTime: SPINE_URLS_STALE_TIME,
  });

  return {
    urls: data ?? EMPTY_URLS,
    refresh: () => {
      const now = Date.now();
      if (now - lastRefresh.current < MIN_REFRESH_INTERVAL_MS) return;
      lastRefresh.current = now;
      void queryClient.invalidateQueries({ queryKey });
    },
  };
}
