import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SignOutButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex w-full justify-start gap-3 rounded-xl border border-border px-6 py-7 text-[15px] text-muted-foreground active:bg-secondary"
    >
      <LogOut className="size-5" />
      {t("auth.signOut")}
    </Button>
  );
}
