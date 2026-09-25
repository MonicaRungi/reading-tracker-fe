import { Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { PULL_THRESHOLD, usePullToRefresh } from "@/hooks/usePullToRefresh";
import { invalidateProgressQueries } from "@/lib/progressQueries";
import { cn } from "@/lib/utils";

const INDICATOR_SIZE = 40;

/**
 * Indicatore di pull-to-refresh dell'app shell. Aggiornare = chiusura attiva
 * degli obiettivi raggiunti + refetch di tutte le query attive (niente reload).
 */
export function PullToRefresh() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { pull, isRefreshing, progress } = usePullToRefresh(async () => {
    await invalidateProgressQueries(queryClient, user?.id);
    await queryClient.refetchQueries({ type: "active" });
  });

  const visible = pull > 0 || isRefreshing;

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 z-30 flex justify-center",
          pull === 0 && "transition-transform duration-200",
          !visible && "invisible",
        )}
        style={{
          top: "env(safe-area-inset-top, 0px)",
          transform: `translateY(${pull - INDICATOR_SIZE}px)`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border"
          style={{ width: INDICATOR_SIZE, height: INDICATOR_SIZE, opacity: Math.max(0.3, progress) }}
        >
          {isRefreshing ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <RefreshCw
              className={cn(
                "size-5 transition-colors",
                pull >= PULL_THRESHOLD ? "text-primary" : "text-muted-foreground",
              )}
              style={{ transform: `rotate(${progress * 270}deg)` }}
            />
          )}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {isRefreshing ? t("common.refreshing") : ""}
      </span>
    </>
  );
}
