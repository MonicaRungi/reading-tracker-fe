import { CheckCircle2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function GoalsBanner({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-2xl bg-status-read-bg px-4 py-3"
    >
      <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-status-read-fg" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-foreground">{title}</p>
        <p className="text-[13px] text-muted-foreground">{message}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label={t("goals.detail.bannerClose")}
        className="-mr-2 rounded-full text-muted-foreground"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
