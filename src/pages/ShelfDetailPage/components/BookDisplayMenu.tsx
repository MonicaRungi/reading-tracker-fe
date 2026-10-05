import { useMemo } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShelfItemDisplay } from "@/api/shelves";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DisplayMenuTarget } from "../hooks/useShelfReorder";
import { DisplayIcon } from "./DisplayIcon";

const OPTIONS: readonly ShelfItemDisplay[] = ["spine", "stack", "cover"];

/**
 * Menu contestuale della posizione di un libro per mouse e tastiera (tasto
 * destro, tasto menu o Maiusc+F10): accanto al libro, con la spunta sulla
 * posizione attuale. Al tocco si usa il cassetto (`DisplayDrawer`).
 */
export function BookDisplayMenu({
  target,
  onChoose,
  onClose,
}: {
  target: DisplayMenuTarget | null;
  onChoose: (display: ShelfItemDisplay) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  // ancora "virtuale": il rettangolo del libro sullo schermo al momento dell'apertura
  const anchorRef = useMemo(
    () => ({ current: { getBoundingClientRect: () => target?.rect ?? new DOMRect() } }),
    [target],
  );

  return (
    <Popover open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        collisionPadding={12}
        aria-label={t("shelves.display.menuLabel", { title: target?.book.library_item.book.title ?? "" })}
        className="w-52 gap-1 rounded-2xl p-2 shadow-[0_10px_30px_rgb(0_0_0/18%)]"
      >
        <div role="menu" className="flex flex-col gap-1">
          {OPTIONS.map((option) => {
            const isCurrent = target?.book.display === option;
            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={isCurrent}
                onClick={() => onChoose(option)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[14px] text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary",
                  isCurrent && "bg-accent text-primary hover:bg-accent",
                )}
              >
                <DisplayIcon display={option} />
                <span className="flex-1">{t(`shelves.display.options.${option}`)}</span>
                {isCurrent && <Check className="size-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
