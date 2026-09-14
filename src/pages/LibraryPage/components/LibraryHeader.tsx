import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LibraryHeader() {
  const { t } = useTranslation();

  return (
    <div className="sticky top-[-1px] z-20 flex h-16 items-center justify-between bg-background px-4">
      <h1 className="text-[30px] font-bold text-foreground">
        {t("library.title")}
      </h1>
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
