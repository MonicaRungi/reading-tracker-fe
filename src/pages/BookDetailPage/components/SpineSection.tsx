import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LibraryItem } from "@/api/library";
import { Spine } from "@/components/shared/Spine";

/** Altezza della copertina in BookHero: la costola le sta accanto alla stessa altezza. */
const SPINE_HEIGHT = 144;

/** Costola accanto alla copertina: la foto se c'è, altrimenti la generata. Tap → sheet. */
export function SpineSection({
  item,
  spineUrl,
  onOpen,
  onPhotoError,
}: {
  item: LibraryItem;
  spineUrl: string | null;
  onOpen: () => void;
  onPhotoError: () => void;
}) {
  const { t } = useTranslation();
  const hasPhoto = Boolean(item.spine_path);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={hasPhoto ? t("spine.section.manage") : t("spine.section.add")}
      className="relative shrink-0 self-start rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Spine
        book={item.book}
        spine_url={spineUrl}
        spine_ratio={item.spine_ratio}
        height={SPINE_HEIGHT}
        onPhotoError={onPhotoError}
      />
      {!hasPhoto && (
        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background"
        >
          <Camera className="size-3.5" />
        </span>
      )}
    </button>
  );
}
