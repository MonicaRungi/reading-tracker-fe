import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ShelfTheme } from "@/api/shelves";
import { BottomSheetContent } from "@/components/shared/BottomSheetContent";
import { ShelfThemePicker } from "@/components/shared/ShelfThemePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTitle } from "@/components/ui/sheet";
import type { ShelfNameError } from "@/lib/shelfName";

/** Crea uno scaffale o ne modifica nome e tema (stesso form, due modalità). */
export function ShelfFormSheet({
  open,
  mode,
  name,
  theme,
  nameError,
  isSaving,
  onNameChange,
  onThemeChange,
  onSubmit,
  onClose,
}: {
  open: boolean;
  mode: "create" | "edit";
  name: string;
  theme: ShelfTheme;
  nameError: ShelfNameError | null;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onThemeChange: (theme: ShelfTheme) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <BottomSheetContent className="gap-0 px-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 pb-5">
          <SheetTitle className="pr-8 text-[20px] font-bold text-foreground">
            {mode === "create" ? t("shelves.form.createTitle") : t("shelves.form.editTitle")}
          </SheetTitle>

          <div className="space-y-2">
            <label htmlFor="shelf-name" className="text-[13px] font-medium text-muted-foreground">
              {t("shelves.form.nameLabel")}
            </label>
            <Input
              id="shelf-name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={t("shelves.form.namePlaceholder")}
              maxLength={60}
              autoComplete="off"
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? "shelf-name-error" : undefined}
              className="h-auto rounded-xl px-4 py-3 text-base aria-invalid:border-destructive md:text-[15px]"
            />
            {nameError && (
              <p id="shelf-name-error" className="text-[13px] text-destructive">
                {t(`shelves.form.nameError.${nameError}`)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-muted-foreground">
              {t("shelves.form.themeLabel")}
            </p>
            <ShelfThemePicker value={theme} onChange={onThemeChange} />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-auto w-full rounded-xl py-[14px] text-[15px] font-medium disabled:opacity-60"
          >
            {isSaving
              ? t("common.loading")
              : mode === "create"
                ? t("shelves.form.create")
                : t("common.save")}
          </Button>
        </form>
      </BottomSheetContent>
    </Sheet>
  );
}
