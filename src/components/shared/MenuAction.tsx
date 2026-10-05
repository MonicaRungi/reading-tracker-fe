import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MenuAction({
  label,
  tone = "default",
  onClick,
}: {
  label: string;
  tone?: "default" | "primary";
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-auto w-full justify-start rounded-xl px-4 py-3.5 text-left text-[15px] font-medium",
        tone === "primary" ? "text-primary" : "text-muted-foreground",
      )}
    >
      {label}
    </Button>
  );
}
