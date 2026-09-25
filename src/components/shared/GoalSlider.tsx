import { Slider } from "@/components/ui/slider";

export function GoalSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  ticks,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  ticks: readonly number[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3 bg-background/60 px-4 pb-4 pt-3">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
        <span className="min-w-9 rounded-lg bg-primary px-2 py-0.5 text-center text-[13px] font-semibold text-primary-foreground">
          {value}
        </span>
      </div>

      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />

      <div className="relative h-4 text-[11px] text-muted-foreground">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
            style={{ left: `${((tick - min) / (max - min)) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}
