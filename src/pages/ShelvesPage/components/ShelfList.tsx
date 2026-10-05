import type { Shelf } from "@/api/shelves";
import type { SpineUrls } from "@/api/spines";
import { ShelfCard } from "./ShelfCard";
import { ShelfCardSkeleton } from "./ShelfCardSkeleton";

const SKELETON_COUNT = 3;

export function ShelfList({
  shelves,
  spineUrls,
  onPhotoError,
  isLoading,
  onOpenShelf,
  onOpenMenu,
}: {
  shelves: Shelf[];
  spineUrls: SpineUrls;
  onPhotoError: () => void;
  isLoading: boolean;
  onOpenShelf: (shelfId: string) => void;
  onOpenMenu: (shelf: Shelf) => void;
}) {
  return (
    <div className="space-y-4 px-4 pb-6">
      {isLoading
        ? Array.from({ length: SKELETON_COUNT }, (_, i) => <ShelfCardSkeleton key={i} />)
        : shelves.map((shelf) => (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              spineUrls={spineUrls}
              onPhotoError={onPhotoError}
              onOpen={() => onOpenShelf(shelf.id)}
              onOpenMenu={() => onOpenMenu(shelf)}
            />
          ))}
    </div>
  );
}
