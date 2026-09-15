import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GoodreadsStatCard({
  icon,
  value,
  label,
  size = "default",
}: {
  icon: ReactNode;
  value: number;
  label: string;
  size?: "default" | "sm";
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-accent px-3 py-4">
      {icon}
      <span
        className={cn(
          "font-bold text-foreground",
          size === "sm" ? "text-[18px]" : "text-[22px]",
        )}
      >
        {value}
      </span>
      <span className="text-center text-[13px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
