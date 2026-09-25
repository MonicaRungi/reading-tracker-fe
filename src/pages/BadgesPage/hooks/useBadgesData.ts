import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";

export function useBadgesData() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const badges = useBadges(user?.id ?? "");

  return {
    data: badges.data,
    ui: badges.ui,
    actions: {
      ...badges.actions,
      goBack: () => navigate(-1),
    },
  };
}
