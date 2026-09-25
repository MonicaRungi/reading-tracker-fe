import type { ComponentProps } from "react";
import { SheetHandle } from "@/components/shared/SheetHandle";
import { SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Contenuto di un bottom sheet con lo stile dell'app: angoli superiori arrotondati,
 * safe area in basso e barretta di trascinamento. Le classi specifiche (padding,
 * altezza massima, layout a colonna) restano a chi lo usa via `className`.
 */
export function BottomSheetContent({
  className,
  handleClassName,
  children,
  ...props
}: Omit<ComponentProps<typeof SheetContent>, "side"> & {
  handleClassName?: string;
}) {
  return (
    <SheetContent
      side="bottom"
      className={cn("rounded-t-[22px] pb-safe pt-2", className)}
      {...props}
    >
      <SheetHandle className={handleClassName} />
      {children}
    </SheetContent>
  );
}
