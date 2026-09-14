import { useTranslation } from "react-i18next";

export function OrDivider() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[13px] text-muted-foreground">{t("auth.or")}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
