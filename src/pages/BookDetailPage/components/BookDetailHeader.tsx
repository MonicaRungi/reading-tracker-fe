import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function BookDetailHeader({
  onBack,
  onOpenMenu,
}: {
  onBack: () => void;
  onOpenMenu: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="h-auto gap-1 p-0 text-primary"
      >
        <ChevronLeft className="size-5" />
        <span className="text-[17px] font-medium">{t("bookDetail.back")}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        className="rounded-full text-muted-foreground"
      >
        <MoreHorizontal className="size-5" />
      </Button>
    </div>
  );
}
