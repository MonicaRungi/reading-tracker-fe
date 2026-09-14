import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

export function MagicLinkForm({
  email,
  isSending,
  onEmailChange,
  onSubmit,
}: {
  email: string;
  isSending: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[13px] font-medium text-foreground">
          {t("auth.emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={t("auth.emailPlaceholder")}
          className="w-full rounded-xl bg-secondary px-4 py-[13px] text-base text-foreground placeholder:text-hint focus:outline-none md:text-[15px]"
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="w-full rounded-xl bg-primary py-[15px] text-[15px] font-medium text-primary-foreground transition-opacity disabled:opacity-60 active:opacity-80"
      >
        {isSending ? t("common.loading") : t("auth.sendMagicLink")}
      </button>
    </form>
  );
}
