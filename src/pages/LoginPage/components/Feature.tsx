import type { ReactNode } from "react";

export function Feature({
  icon,
  title,
  sub,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[5px]">
      <div className="text-primary">{icon}</div>
      <span className="text-[12px] font-medium text-foreground">{title}</span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </div>
  );
}
