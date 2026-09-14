import { useTranslation } from "react-i18next";

export function LoginHero() {
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden bg-accent px-7 pb-10"
      style={{
        paddingTop: `max(4rem, env(safe-area-inset-top, 0px) + 1.5rem)`,
      }}
    >
      <div className="max-w-[180px]">
        <h1 className="text-[28px] font-bold leading-[1.15] text-foreground">
          {t("auth.heroLine1")}
          <br />
          {t("auth.heroLine2")}
          <br />
          <span className="text-primary">{t("auth.heroAccent")}</span>
        </h1>
      </div>

      <img
        src="/books-hero.png"
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-4 h-44 w-auto object-contain dark:hidden"
      />
      <img
        src="/books-hero-dark.png"
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-4 hidden h-44 w-auto object-contain dark:block"
      />

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        {t("auth.heroSubtitle")}
      </p>
    </div>
  );
}
