import type { DecorDefinition } from "@/lib/decor";
import { decorSize } from "@/lib/decor";
import { cn } from "@/lib/utils";

/**
 * Una decorazione come sta sulla mensola. L'immagine è uno sfondo (non un
 * <img>, che su iOS con la pressione lunga si ingrandisce); la parte sotto la
 * base d'appoggio (es. foglie ricadenti) scende davanti al bordo del piano.
 * Quelle appese occupano tutta la riga, agganciate in alto.
 */
export function DecorFace({
  decor,
  spineHeight,
  className,
}: {
  decor: DecorDefinition;
  /** Altezza di riferimento di un dorso in piedi. */
  spineHeight: number;
  className?: string;
}) {
  const size = decorSize(decor, spineHeight);

  return (
    <div
      aria-hidden="true"
      // sopra il piano, che nel DOM viene dopo la riga; ombra di contatto come
      // quella dei dorsi (drop-shadow segue la sagoma, non il riquadro)
      className={cn(
        "relative z-[1] shrink-0 bg-contain bg-no-repeat drop-shadow-[0_2px_2px_rgb(0_0_0/22%)]",
        decor.hanging ? "bg-top" : "bg-bottom",
        className,
      )}
      style={{
        width: size.width,
        height: size.height,
        marginBottom: -size.overhang,
        // le appese salgono fino al piano di sopra senza allungare la riga
        marginTop: -size.rise,
        backgroundImage: `url("${decor.src}")`,
      }}
    />
  );
}
