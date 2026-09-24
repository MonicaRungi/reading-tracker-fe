import {
  Illustration,
  type IllustrationName,
} from "@/components/shared/Illustration";
import { cn } from "@/lib/utils";

/**
 * Titolo + sottotitolo dei passaggi dell'onboarding.
 * - `side`: illustrazione a destra del testo (passo di scelta)
 * - `centered`: illustrazione sopra, testo centrato (riepilogo)
 */
export function OnboardingIntro({
  title,
  subtitle,
  illustration,
  layout = "side",
}: {
  title: string;
  subtitle: string;
  illustration?: IllustrationName;
  layout?: "side" | "centered";
}) {
  const isCentered = layout === "centered";

  return (
    <header
      className={cn(
        "flex gap-3",
        isCentered ? "flex-col items-center text-center" : "items-center",
      )}
    >
      {illustration && isCentered && (
        <Illustration name={illustration} className="mb-2 size-32" />
      )}
      <div className={cn("min-w-0 space-y-1", !isCentered && "flex-1")}>
        <h1
          className={cn(
            "font-bold leading-tight text-foreground",
            isCentered ? "text-[26px]" : "text-[28px]",
          )}
        >
          {title}
        </h1>
        <p className="text-[14px] text-muted-foreground">{subtitle}</p>
      </div>
      {illustration && !isCentered && (
        <Illustration name={illustration} className="size-32" />
      )}
    </header>
  );
}
