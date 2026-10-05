import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LibraryItem } from "@/api/library";
import { Spine } from "@/components/shared/Spine";

/** Altezza della copertina in BookHero: il dorso le sta accanto alla stessa altezza. */
const SPINE_HEIGHT = 144;

/**
 * Dorso accanto alla copertina. Con la foto mostra il dorso fotografato; senza,
 * uno spazio tratteggiato con "+" che invita ad aggiungerla. Tap → sheet.
 */
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

  if (!item.spine_path) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("spine.section.add")}
        className="flex h-[144px] w-10 shrink-0 items-center justify-center self-start rounded-[10px] border-[1.5px] border-dashed border-primary/60 bg-accent/60 text-primary transition-colors active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Plus className="size-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("spine.section.manage")}
      className="shrink-0 self-start rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Spine
        book={item.book}
        spine_url={spineUrl}
        spine_ratio={item.spine_ratio}
        height={SPINE_HEIGHT}
        onPhotoError={onPhotoError}
      />
    </button>
  );
}
