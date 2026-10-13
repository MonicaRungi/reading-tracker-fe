import { Hand } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShelfEntry } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { ShelfBookFace } from "@/components/shared/ShelfBookFace";
import { decorByKey } from "@/lib/decor";
import { SHELF_SPINE_HEIGHT } from "@/lib/shelfLayout";
import { DecorFace } from "./DecorFace";

const LIFTED = "-translate-y-2 rotate-6 scale-105";

/** Copia dell'elemento che segue il dito, come sta sulla mensola: sollevata, inclinata, con l'etichetta "Sposta". */
export function DraggedItem({ item, spineUrls }: { item: ShelfEntry; spineUrls: SpineUrls }) {
  const { t } = useTranslation();
  const decor = item.item_type === "decor" ? decorByKey(item.decor_key) : null;

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute -top-11 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-[13px] font-medium text-white shadow-[0_4px_12px_rgb(0_0_0/30%)] ring-1 ring-white/15 backdrop-blur-sm"
      >
        <Hand className="size-4" aria-hidden="true" />
        {t("shelves.reorder.moving")}
      </span>
      {item.item_type === "book" ? (
        <ShelfBookFace
          book={item}
          spineUrl={item.library_item.spine_path ? spineUrls[item.library_item.spine_path] : undefined}
          height={SHELF_SPINE_HEIGHT}
          className={`${LIFTED} shadow-[0_14px_22px_rgb(0_0_0/40%)]`}
        />
      ) : (
        decor && (
          // l'ombra segue la sagoma (drop-shadow), non il riquadro dell'immagine
          <DecorFace
            decor={decor}
            spineHeight={SHELF_SPINE_HEIGHT}
            className={`${LIFTED} drop-shadow-[0_14px_14px_rgb(0_0_0/35%)]`}
          />
        )
      )}
    </div>
  );
}
