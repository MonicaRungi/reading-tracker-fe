import { useTranslation } from "react-i18next";
import { GoogleIcon } from "@/assets/icons/GoogleIcon";
import { ChevronRightIcon } from "@/assets/icons/ChevronRightIcon";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex w-full justify-between gap-3 rounded-xl border border-border px-6 py-7 text-[15px] text-muted-foreground active:bg-secondary"
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
    </Button>
  );
}
