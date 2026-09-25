import type { NotificationRow } from "@/types/database.types"

export type NotificationType = "goal_renewal" | "book_release" | "badge_unlocked"

export interface BadgeUnlockedPayload {
  badge_id: string
  badge_key: string
  badge_title: string
  icon_key: string
}

export interface GoalRenewalPayload {
  goal_id: string
  goal_type: "days" | "pages"
  target: number
  status: "achieved" | "failed"
  period_end: string
}

export interface BookReleasePayload {
  book_id: string
  library_item_id: string
  book_title: string
}

/** Notifica con payload tipizzato in base a `type`. */
export type AppNotification = Omit<NotificationRow, "type" | "payload"> &
  (
    | { type: "badge_unlocked"; payload: BadgeUnlockedPayload }
    | { type: "goal_renewal"; payload: GoalRenewalPayload }
    | { type: "book_release"; payload: BookReleasePayload }
  )
