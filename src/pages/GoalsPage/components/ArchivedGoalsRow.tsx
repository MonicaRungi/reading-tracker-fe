import { Archive, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function ArchivedGoalsRow({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      className="h-auto w-full justify-start gap-3 rounded-2xl bg-card px-4 py-3.5 text-[14px] font-normal text-foreground hover:bg-card"
    >
      <Archive className="size-5 text-muted-foreground" aria-hidden="true" />
      <span className="flex-1 text-left">
        {t("goals.detail.archivedRow", { count })}
      </span>
      <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
    </Button>
  );
}
