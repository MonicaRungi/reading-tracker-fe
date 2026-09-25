import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatPercent } from "@/lib/format";

/** "8 di 12 libri" in corallo, barra e percentuale. */
export function GoalProgressRow({ label, ratio }: { label: string; ratio: number }) {
  const clamped = Math.min(1, Math.max(0, ratio));

  return (
    <div className="space-y-1.5">
      <p className="text-right text-[13px] font-semibold text-primary">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={clamped * 100} />
        </div>
        <span className="w-9 text-right text-[12px] text-muted-foreground">
          {formatPercent(clamped)}
        </span>
      </div>
    </div>
  );
}
