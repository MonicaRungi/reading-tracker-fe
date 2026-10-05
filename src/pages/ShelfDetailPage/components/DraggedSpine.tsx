import { Hand } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShelfBook } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { Spine } from "@/components/shared/Spine";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";

/** Copia della costola che segue il dito: sollevata, inclinata, con l'etichetta "Sposta". */
export function DraggedSpine({ book, spineUrls }: { book: ShelfBook; spineUrls: SpineUrls }) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute -top-11 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_4px_12px_rgb(0_0_0/30%)] ring-1 ring-white/15 backdrop-blur-sm"
      >
        <Hand className="size-4" aria-hidden="true" />
        {t("shelves.reorder.moving")}
      </span>
      <Spine
        book={book.library_item.book}
        spine_url={book.library_item.spine_path ? spineUrls[book.library_item.spine_path] : undefined}
        spine_ratio={book.library_item.spine_ratio}
        height={SHELF_SPINE_HEIGHT}
        className="-translate-y-2 rotate-6 scale-105 shadow-[0_14px_22px_rgb(0_0_0/40%)]"
      />
    </div>
  );
}
