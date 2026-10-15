import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Voce di un menu a foglio, con icona facoltativa; `destructive` per le azioni distruttive. */
export function MenuAction({
  label,
  icon: Icon,
  tone = "default",
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "destructive";
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-auto w-full justify-start gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium active:bg-secondary",
        tone === "primary" && "text-primary",
        tone === "default" && "text-muted-foreground",
        tone === "destructive" && "text-destructive hover:text-destructive",
      )}
    >
      {Icon && <Icon className="size-5 shrink-0" aria-hidden="true" />}
      {label}
    </Button>
  );
}
