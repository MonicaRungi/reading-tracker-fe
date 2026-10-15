import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/**
 * Schermata al posto della pagina bianca quando l'app va in errore. Il
 * dettaglio serve a capire il problema: lo si può mandare in uno screenshot.
 */
export function AppCrashScreen({ error, componentStack }: { error: Error; componentStack: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-[20px] font-bold text-foreground">{t("crash.title")}</h1>
      <p className="max-w-sm text-[14px] text-muted-foreground">{t("crash.description")}</p>
      <Button onClick={() => window.location.reload()} className="h-auto rounded-xl px-6 py-3 text-[15px]">
        {t("crash.reload")}
      </Button>
      <details className="w-full max-w-sm text-left">
        <summary className="cursor-pointer text-center text-[13px] text-muted-foreground">
          {t("crash.details")}
        </summary>
        <pre className="mt-2 max-h-[40svh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-secondary p-3 text-[11px] leading-snug text-foreground">
          {`${error.name}: ${error.message}\n\n${error.stack ?? ""}\n\n${componentStack}`}
        </pre>
      </details>
    </div>
  );
}
