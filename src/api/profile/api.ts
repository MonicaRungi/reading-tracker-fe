import { supabase } from "@/lib/supabase"
import type { Profile } from "./types"

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) return null
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    displayName: (data.user.user_metadata?.display_name as string | undefined) ?? null,
  }
}
