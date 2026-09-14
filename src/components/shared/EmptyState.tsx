import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  size?: "sm" | "lg"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "sm",
}: EmptyStateProps) {
  const isLarge = size === "lg"

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-4 py-12 text-center",
        isLarge && "flex-1 justify-center gap-4 px-8",
      )}
    >
      {isLarge ? (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Icon className="size-10 text-primary" aria-hidden="true" />
        </div>
      ) : (
        <Icon className="size-8 text-hint" aria-hidden="true" />
      )}

      <p
        className={cn(
          "font-medium text-foreground",
          isLarge && "text-[18px] font-semibold",
        )}
      >
        {title}
      </p>

      {description ? (
        <p
          className={cn(
            "text-sm text-muted-foreground",
            isLarge && "text-[14px] leading-relaxed",
          )}
        >
          {description}
        </p>
      ) : null}

      {action ? (
        <Button
          onClick={action.onClick}
          className="mt-2 h-auto rounded-xl px-8 py-3 text-[15px] font-medium"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
