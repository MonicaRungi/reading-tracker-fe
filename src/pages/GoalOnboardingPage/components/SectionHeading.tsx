import type { LucideIcon } from "lucide-react";

export function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent">
        <Icon className="size-[18px] text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold leading-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
