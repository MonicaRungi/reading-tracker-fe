import { useQuery } from "@tanstack/react-query"
import { getStats } from "@/api/stats"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"

export function useProfileData() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const userId = user?.id ?? ""

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", userId],
    queryFn: () => getStats(userId),
    enabled: Boolean(userId),
  })

  return {
    data: { email: user?.email ?? "", stats, isLoading },
    ui: { theme },
    actions: { setTheme, signOut },
  }
}
