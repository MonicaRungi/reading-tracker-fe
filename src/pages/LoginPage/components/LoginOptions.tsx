import { useTranslation } from "react-i18next";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function LoginOptions({
  onGoogleSignIn,
}: {
  onGoogleSignIn: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5 bg-background px-7 py-8">
      <GoogleSignInButton onClick={onGoogleSignIn} />

      <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
        {t("auth.loginHint")}
      </p>
    </div>
  );
}
