import type { ProfileRow } from "@/types/database.types"

export type ThemePreference = "light" | "dark" | "auto"

// Profile per la UI: aggiungiamo email (che viene da auth, non dalla tabella profiles)
export interface Profile extends ProfileRow {
  email: string
}