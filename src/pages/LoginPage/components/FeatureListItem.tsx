import type { ReactNode } from "react";

export function FeatureListItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-primary">
        {icon}
      </div>
      <div>
        <p className="font-semibold leading-5 text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
