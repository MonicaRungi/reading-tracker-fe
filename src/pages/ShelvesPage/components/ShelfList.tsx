import type { Shelf } from "@/api/shelves";
import { ShelfCard } from "./ShelfCard";
import { ShelfCardSkeleton } from "./ShelfCardSkeleton";

const SKELETON_COUNT = 3;

export function ShelfList({
  shelves,
  isLoading,
  onOpenShelf,
  onOpenMenu,
}: {
  shelves: Shelf[];
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
              onOpen={() => onOpenShelf(shelf.id)}
              onOpenMenu={() => onOpenMenu(shelf)}
            />
          ))}
    </div>
  );
}
