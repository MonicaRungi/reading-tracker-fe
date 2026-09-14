import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { OrDivider } from "./OrDivider";
import { MagicLinkForm } from "./MagicLinkForm";

export function LoginOptions({
  email,
  isSending,
  onEmailChange,
  onSubmit,
  onGoogleSignIn,
}: {
  email: string;
  isSending: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent) => void;
  onGoogleSignIn: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <GoogleSignInButton onClick={onGoogleSignIn} />
      <OrDivider />
      <MagicLinkForm
        email={email}
        isSending={isSending}
        onEmailChange={onEmailChange}
        onSubmit={onSubmit}
      />
      <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
        {t("auth.magicLinkHint")}
      </p>
    </>
  );
}
