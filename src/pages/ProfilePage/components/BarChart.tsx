import type { ChartPoint } from "../hooks/useProfileData";

export function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height: 80 }}>
      {data.map((d) => {
        const height = Math.max(4, Math.round((d.value / max) * 72));
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md ${d.isActive ? "bg-primary" : "bg-primary/30"}`}
              style={{ height }}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
