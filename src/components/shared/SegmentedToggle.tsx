import { cn } from "cn"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface SegmentedToggleOption<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  className,
}: {
  value: T
  options: SegmentedToggleOption<T>[]
  onChange: (value: T) => void
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T)
      }}
      className={cn("w-full gap-0 rounded-full bg-secondary p-1", size === "sm" && "p-0.5", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            "flex-1 items-center gap-1.5 rounded-full font-medium text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
            size === "sm" ? "px-3 py-1.5 text-[11px]" : "py-2.5 text-[14px]",
          )}
        >
          {option.icon}
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
