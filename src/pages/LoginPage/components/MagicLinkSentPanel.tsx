import { useTranslation } from "react-i18next";
import { MailIcon } from "@/assets/icons/MailIcon";
import { Button } from "@/components/ui/button";

export function MagicLinkSentPanel({
  email,
  onChangeEmail,
}: {
  email: string;
  onChangeEmail: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
        <MailIcon />
      </div>
      <h2 className="text-[18px] font-semibold text-foreground">
        {t("auth.checkEmail")}
      </h2>
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        {t("auth.magicLinkSentTo")} <strong>{email}</strong>
      </p>
      <Button
        variant="link"
        type="button"
        onClick={onChangeEmail}
        className="mt-2 text-[14px] font-medium text-primary"
      >
        {t("auth.changeEmail")}
      </Button>
    </div>
  );
}
