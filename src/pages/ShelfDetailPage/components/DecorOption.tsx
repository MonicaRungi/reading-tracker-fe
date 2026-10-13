import { useTranslation } from "react-i18next";
import type { DecorDefinition } from "@/lib/decor";
import { cn } from "@/lib/utils";

/** Una decorazione nella griglia dello sheet: immagine su un riquadro e nome. */
export function DecorOption({
  decor,
  isAdding,
  disabled,
  onSelect,
}: {
  decor: DecorDefinition;
  isAdding: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-busy={isAdding}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl p-2 text-[13px] font-medium text-foreground transition-colors active:bg-secondary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60",
        isAdding && "animate-pulse",
      )}
    >
      <span
        aria-hidden="true"
        className="flex aspect-square w-full items-end justify-center rounded-xl bg-secondary p-3"
      >
        {/* sfondo, non <img>: niente ingrandimento con la pressione lunga su iOS */}
        <span
          className="h-full w-full bg-contain bg-bottom bg-no-repeat"
          style={{ backgroundImage: `url("${decor.src}")` }}
        />
      </span>
      {t(`shelves.decor.items.${decor.key}`)}
    </button>
  );
}
