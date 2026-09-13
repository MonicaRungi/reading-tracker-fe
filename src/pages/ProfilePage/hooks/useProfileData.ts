import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { updateProfileTheme, type ThemePreference } from "@/api/profile";
import { getStats } from "@/api/stats";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export function useProfileData() {
  const { user, signOut } = useAuth();
  const { theme, setTheme: setLocalTheme } = useTheme();
  const userId = user?.id ?? "";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", userId],
    queryFn: () => getStats(),
    enabled: Boolean(userId),
  });

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setLocalTheme(next);
      void updateProfileTheme(next);
    },
    [setLocalTheme],
  );

  return {
    data: { email: user?.email ?? "", stats, isLoading },
    ui: { theme },
    actions: { setTheme, signOut },
  };
}
