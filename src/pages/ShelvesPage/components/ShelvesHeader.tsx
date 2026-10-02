import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function ShelvesHeader({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-[-1px] z-20 flex h-16 items-center justify-between bg-background px-4">
      <h1 className="text-[30px] font-bold text-foreground">{t("shelves.title")}</h1>
      {onCreate && (
        <Button
          onClick={onCreate}
          className="h-9 gap-1.5 rounded-full px-4 text-[14px] font-medium"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("shelves.new")}
        </Button>
      )}
    </div>
  );
}
