import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function useLoginData() {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch {
      toast.error(t("common.error"));
    }
  }

  return {
    actions: { handleGoogleSignIn },
  };
}
