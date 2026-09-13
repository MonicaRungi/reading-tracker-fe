import { useTranslation } from "react-i18next"
import type { ReadingStatus } from "@/api/library"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<ReadingStatus, string> = {
  to_read: "bg-status-to-read-bg text-status-to-read-fg",
  reading: "bg-status-reading-bg text-status-reading-fg",
  read: "bg-status-read-bg text-status-read-fg",
  abandoned: "bg-status-abandoned-bg text-status-abandoned-fg",
}

export function StatusBadge({ status, className }: { status: ReadingStatus; className?: string }) {
  const { t } = useTranslation()

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}
