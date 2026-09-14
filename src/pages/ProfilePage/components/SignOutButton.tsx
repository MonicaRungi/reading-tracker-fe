import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SignOutButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-[15px] text-muted-foreground active:bg-secondary"
    >
      <LogOut className="size-5" />
      {t("auth.signOut")}
    </button>
  );
}
