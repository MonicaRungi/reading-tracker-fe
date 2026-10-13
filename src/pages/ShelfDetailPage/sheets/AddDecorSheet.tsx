import { useTranslation } from "react-i18next";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { Sheet, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { decorSections } from "@/lib/decor";
import { DecorOption } from "../components/DecorOption";

const SECTIONS = decorSections();

/** Catalogo delle decorazioni, diviso per sezioni: un tocco mette l'oggetto in fondo alla mensola. */
export function AddDecorSheet({
  open,
  addingKey,
  onAdd,
  onClose,
}: {
  open: boolean;
  /** Decorazione in corso di aggiunta, o null. */
  addingKey: string | null;
  onAdd: (decorKey: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent className="px-5">
        <SheetTitle className="pr-8 text-[20px] font-bold text-foreground">
          {t("shelves.decor.sheetTitle")}
        </SheetTitle>
        <SheetDescription className="mt-1 text-[14px] text-muted-foreground">
          {t("shelves.decor.sheetSubtitle")}
        </SheetDescription>

        <div className="-mx-5 mt-2 max-h-[65svh] overflow-y-auto px-5 pb-6">
          {SECTIONS.map(({ category, items }) => (
            <section key={category} aria-labelledby={`decor-section-${category}`} className="mt-4">
              <h3
                id={`decor-section-${category}`}
                className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {t(`shelves.decor.categories.${category}`)}
              </h3>
              <div className="-mx-2 mt-1 grid grid-cols-3 gap-1">
                {items.map((decor) => (
                  <DecorOption
                    key={decor.key}
                    decor={decor}
                    isAdding={addingKey === decor.key}
                    disabled={addingKey !== null}
                    onSelect={() => onAdd(decor.key)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </BottomSheetContent>
    </Sheet>
  );
}
