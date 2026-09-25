import type { CSSProperties } from "react";
import { CheckCircle2, CircleAlert, Info, Loader2, TriangleAlert } from "lucide-react";
import { Toaster } from "sonner";

const SAFE_TOP = "calc(env(safe-area-inset-top, 0px) + 12px)";

/**
 * Toaster con lo stile dell'app: card con bordo e angoli arrotondati, colori dai
 * token del tema (chiaro/scuro automatici), icone lucide in corallo. I toast
 * possono passare un'icona propria (badge sbloccato, libro uscito).
 * Le classi usano `!` perché Sonner applica i suoi stili con selettori
 * `[data-sonner-toast][data-styled]`, più specifici di una classe.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      offset={{ top: SAFE_TOP }}
      mobileOffset={{ top: SAFE_TOP, left: 16, right: 16 }}
      gap={8}
      icons={{
        success: <CheckCircle2 className="size-5 text-primary" />,
        error: <CircleAlert className="size-5 text-destructive" />,
        info: <Info className="size-5 text-primary" />,
        warning: <TriangleAlert className="size-5 text-primary" />,
        loading: <Loader2 className="size-5 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "gap-3! rounded-2xl! border-border! bg-card! px-4! py-3! font-sans! text-foreground! shadow-lg!",
          title: "text-[14px]! font-semibold! leading-snug! text-foreground!",
          description: "text-[13px]! leading-snug! text-muted-foreground!",
          icon: "m-0! h-auto! w-auto!",
        },
      }}
    />
  );
}
