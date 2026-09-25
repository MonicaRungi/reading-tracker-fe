import { cn } from "@/lib/utils";

/** Barretta di trascinamento in cima ai bottom sheet. */
export function SheetHandle({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("mx-auto mb-4 h-1 w-9 shrink-0 rounded-full bg-border", className)}
    />
  );
}
