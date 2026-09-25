import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OnboardingHeader({
  current,
  total,
  onBack,
}: {
  current: number;
  total: number;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-[-1px] z-10 flex items-center gap-3 bg-background px-2 pb-2 pt-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label={t("bookDetail.back")}
        className="rounded-full text-foreground"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < current ? "bg-primary" : "bg-accent",
            )}
          />
        ))}
      </div>

      <span className="pr-2 text-[13px] text-muted-foreground">
        {t("goals.stepOf", { current, total })}
      </span>
    </div>
  );
}
