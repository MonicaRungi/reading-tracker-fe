import { cn } from "@/lib/utils";
import { RadioGroupItem } from "@/components/ui/radio-group";
import {
  Illustration,
  type IllustrationName,
} from "@/components/shared/Illustration";

export function PrimaryGoalOption({
  value,
  title,
  hint,
  illustration,
  selected,
  children,
}: {
  value: string;
  title: string;
  hint: string;
  illustration: IllustrationName;
  selected: boolean;
  children?: React.ReactNode;
}) {
  const id = `primary-goal-${value}`;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card px-4 py-3.5 transition-colors",
        selected ? "border-primary bg-accent" : "border-border",
      )}
    >
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
        <RadioGroupItem id={id} value={value} className="size-5 border-muted-foreground/50" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-foreground">
            {title}
          </span>
          <span className="block text-[12px] text-muted-foreground">{hint}</span>
        </span>
        <Illustration name={illustration} className="-my-1 size-12" />
      </label>
      {children}
    </div>
  );
}
