import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function useLoginData() {
  const { t } = useTranslation();
  const { signInWithMagicLink, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleMagicLinkSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSending(true);
    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSending(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch {
      toast.error(t("common.error"));
    }
  }

  return {
    data: { email },
    ui: { isSending, sent },
    actions: {
      setEmail,
      handleMagicLinkSubmit,
      handleGoogleSignIn,
      resetSent: () => setSent(false),
    },
  };
}
