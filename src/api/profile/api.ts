import { supabase } from "@/lib/supabase"
import type { Profile, ThemePreference } from "./types"

export async function getProfile(): Promise<Profile | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  return {
    ...data,
    email: userData.user.email ?? "",
  }
}

export async function updateProfileTheme(theme: ThemePreference): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ theme })
    .select()
    .single()
  if (error) throw error
}

export async function updateDisplayName(displayName: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .select()
    .single()
  if (error) throw error
}