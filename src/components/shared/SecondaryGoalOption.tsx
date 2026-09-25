import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Illustration,
  type IllustrationName,
} from "@/components/shared/Illustration";

export function SecondaryGoalOption({
  id,
  label,
  hint,
  illustration,
  checked,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  illustration: IllustrationName;
  checked: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-colors",
        checked ? "border-primary bg-accent" : "border-border",
      )}
    >
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-3 px-4 py-3.5"
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onToggle}
          className="size-5 rounded-md border-muted-foreground/50"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-snug text-foreground">
            {label}
          </span>
          {hint && (
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
        <Illustration name={illustration} className="-my-1 size-10" />
      </label>
      {checked && children}
    </div>
  );
}
