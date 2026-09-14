import { useTranslation } from "react-i18next";
import { GoogleIcon } from "@/assets/icons/GoogleIcon";
import { ChevronRightIcon } from "@/assets/icons/ChevronRightIcon";

export function GoogleSignInButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-[14px] transition-colors active:bg-muted"
    >
      <div className="flex items-center gap-3">
        <GoogleIcon />
        <span className="text-[15px] font-medium text-foreground">
          {t("auth.continueWithGoogle")}
        </span>
      </div>
      <span className="text-muted-foreground">
        <ChevronRightIcon />
      </span>
    </button>
  );
}
