import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  /**
   * - `sm`: vuoto di una sezione (icona piccola)
   * - `lg`: vuoto di pagina intera (icona in cerchio, centrato in verticale)
   * - `inline`: messaggio compatto su card, dentro una sezione o un foglio
   */
  size?: "sm" | "lg" | "inline"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "sm",
}: EmptyStateProps) {
  const isLarge = size === "lg"
  const isInline = size === "inline"

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-4 py-12 text-center",
        isLarge && "flex-1 justify-center gap-4 px-8",
        isInline && "gap-1.5 rounded-2xl bg-card py-5",
      )}
    >
      {Icon &&
        (isLarge ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
            <Icon className="size-10 text-primary" aria-hidden="true" />
          </div>
        ) : (
          <Icon
            className={cn("size-8 text-hint", isInline && "size-6")}
            aria-hidden="true"
          />
        ))}

      <p
        className={cn(
          "font-medium text-foreground",
          isLarge && "text-[18px] font-semibold",
          isInline && "text-[13px] font-normal text-muted-foreground",
        )}
      >
        {title}
      </p>

      {description ? (
        <p
          className={cn(
            "text-sm text-muted-foreground",
            isLarge && "text-[14px] leading-relaxed",
            isInline && "text-[12px]",
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
