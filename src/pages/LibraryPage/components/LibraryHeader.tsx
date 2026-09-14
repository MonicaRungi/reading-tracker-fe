import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LibraryHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-4">
      <h1 className="text-[30px] font-bold text-foreground">{t("library.title")}</h1>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifiche"
        className="h-9 w-9 rounded-full bg-secondary text-muted-foreground"
      >
        <Bell className="size-5" />
      </Button>
    </div>
  );
}
