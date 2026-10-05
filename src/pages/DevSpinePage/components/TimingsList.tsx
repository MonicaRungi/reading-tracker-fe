import { useTranslation } from "react-i18next";

/** Tempi dei passaggi della pipeline, in millisecondi. */
export function TimingsList({ title, timings }: { title: string; timings: Record<string, number> }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-card p-3 shadow-card">
      <p className="mb-1 text-[13px] font-semibold text-foreground">{title}</p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 font-mono text-[12px] text-muted-foreground">
        {Object.entries(timings).map(([step, ms]) => (
          <div key={step} className="contents">
            <dt className="whitespace-pre">{step}</dt>
            <dd className="text-right text-foreground">{t("dev.spine.ms", { ms })}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
