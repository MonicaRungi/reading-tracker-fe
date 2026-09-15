import { useEffect, useState } from "react";

import type { ChartPoint } from "../hooks/useProfileData";

export function BarChart({ data }: { data: ChartPoint[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    if (selectedIndex === null) return;

    const timeout = window.setTimeout(() => {
      setSelectedIndex(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [selectedIndex]);

  return (
    <div className="flex gap-2">
      {data.map((d, index) => {
        const height = Math.max(4, Math.round((d.value / max) * 72));
        const isSelected = selectedIndex === index;

        return (
          <button
            key={d.label}
            type="button"
            aria-label={`${d.label}: ${d.value}`}
            aria-pressed={isSelected}
            onClick={() => {
              setSelectedIndex(isSelected ? null : index);
            }}
            className="flex min-w-0 flex-1 cursor-pointer touch-manipulation flex-col items-center gap-1 bg-transparent p-0"
          >
            <div className="relative flex h-[72px] w-full items-end">
              <span
                className={`
                  pointer-events-none absolute left-1/2 z-10
                  -translate-x-1/2 whitespace-nowrap
                  rounded-md bg-muted-foreground/85 px-2 py-1
                  text-[11px] font-semibold text-background shadow-sm
                  transition-all duration-200
                  ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${
                    isSelected
                      ? "translate-y-0 scale-100 opacity-100"
                      : "translate-y-1 scale-90 opacity-0"
                  }
                `}
                style={{
                  bottom: height + 6,
                }}
              >
                {d.value}
              </span>

              <div
                className={`
                  w-full origin-bottom rounded-t-sm
                  transition-all duration-200 ease-out
                  active:scale-[0.97]
                  ${
                    d.isActive
                      ? "bg-primary"
                      : isSelected
                        ? "bg-primary/45"
                        : "bg-primary/30"
                  }
                  ${isSelected ? "scale-x-[1.03]" : "scale-x-100"}
                `}
                style={{ height }}
              />
            </div>

            <span
              className={`
                text-[10px] transition-colors duration-200
                ${
                  isSelected
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              `}
            >
              {d.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}