import { useState } from "react";
import { Award } from "lucide-react";
import { badgeIconUrl } from "@/lib/badges";
import { cn } from "@/lib/utils";

/**
 * Icona di un badge da `public/badges/<icon_key>.png`.
 * Da sbloccare: desaturata e attenuata, mai nascosta.
 * Se l'asset manca (es. annuale non ancora disegnato) mostra un fallback.
 */
export function BadgeIcon({
  iconKey,
  locked,
  className,
}: {
  iconKey: string;
  locked: boolean;
  className?: string;
}) {
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const lockedStyle = locked && "opacity-45 grayscale";

  if (failedKey === iconKey) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-accent",
          lockedStyle,
          className,
        )}
      >
        <Award className="size-1/2 text-primary" />
      </div>
    );
  }

  return (
    <img
      src={badgeIconUrl(iconKey)}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      onError={() => setFailedKey(iconKey)}
      className={cn(
        "shrink-0 select-none object-contain transition-[filter,opacity]",
        lockedStyle,
        className,
      )}
    />
  );
}
