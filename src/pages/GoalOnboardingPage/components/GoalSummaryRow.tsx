import {
  Illustration,
  type IllustrationName,
} from "@/components/shared/Illustration";

export function GoalSummaryRow({
  illustration,
  label,
  value,
  hint,
}: {
  illustration: IllustrationName;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3 py-4">
      <Illustration name={illustration} className="size-12" />
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="text-[26px] font-bold leading-tight text-foreground">
          {value}
        </p>
        <p className="text-[13px] text-foreground">{hint}</p>
      </div>
    </div>
  );
}
