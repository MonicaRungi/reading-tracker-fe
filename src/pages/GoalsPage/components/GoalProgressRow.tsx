import { ProgressBar } from "@/components/shared/ProgressBar";
import { useCountUp } from "@/hooks/useCountUp";
import { formatPercent } from "@/lib/format";

/** "8 di 12 libri" in corallo, barra e percentuale. */
export function GoalProgressRow({
  label,
  ratio,
  animate,
  onFilled,
}: {
  label: string;
  ratio: number;
  animate?: boolean;
  onFilled?: () => void;
}) {
  const clamped = Math.min(1, Math.max(0, ratio));
  // Con la barra animata la percentuale conta insieme a lei.
  const shownRatio = useCountUp(clamped, { enabled: animate === true });

  return (
    <div className="space-y-1.5">
      <p className="text-right text-[13px] font-semibold text-primary">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar percent={clamped * 100} animate={animate} onFilled={onFilled} />
        </div>
        <span className="w-9 text-right text-[12px] text-muted-foreground">
          {formatPercent(shownRatio)}
        </span>
      </div>
    </div>
  );
}
