import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function ShelvesHeader({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="sticky top-[-1px] z-20 flex h-16 items-center justify-between bg-background px-4">
        <h1 className="text-[30px] font-bold text-foreground">{t("shelves.title")}</h1>
        {onCreate && (
          <Button
            size="icon"
            onClick={onCreate}
            aria-label={t("shelves.form.createTitle")}
            className="size-10 rounded-full"
          >
            <Plus className="size-5" />
          </Button>
        )}
      </div>
      <p className="max-w-[16rem] px-4 pb-4 text-[14px] leading-snug text-muted-foreground">
        {t("shelves.subtitle")}
      </p>
    </>
  );
}
