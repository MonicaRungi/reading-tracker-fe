import { Heart, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Shelf } from "@/api/shelves";

export function ShelfPicker({
  shelves,
  selectedIds,
  onSelectedIdsChange,
  isAddingShelf,
  newShelfName,
  onNewShelfNameChange,
  onStartAddingShelf,
  onConfirmNewShelf,
}: {
  shelves: Shelf[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  isAddingShelf: boolean;
  newShelfName: string;
  onNewShelfNameChange: (name: string) => void;
  onStartAddingShelf: () => void;
  onConfirmNewShelf: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="multiple"
        value={selectedIds}
        onValueChange={onSelectedIdsChange}
        className="flex flex-wrap gap-2"
      >
        {shelves.map((shelf) => (
          <ToggleGroupItem
            key={shelf.id}
            value={shelf.id}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[13px] font-medium text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-primary"
          >
            {shelf.name === "Preferiti" && (
              <Heart
                className="size-3.5"
                fill={selectedIds.includes(shelf.id) ? "currentColor" : "none"}
              />
            )}
            {shelf.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isAddingShelf ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={newShelfName}
            onChange={(e) => onNewShelfNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConfirmNewShelf()}
            placeholder={t("search.newShelfPlaceholder")}
            className="h-auto w-32 rounded-full border-border bg-transparent px-3 py-1.5 text-base shadow-none md:text-[13px]"
          />
          <Button
            variant="link"
            size="sm"
            onClick={onConfirmNewShelf}
            className="h-auto p-0 text-[13px] font-medium text-primary"
          >
            {t("common.confirm")}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={onStartAddingShelf}
          className="h-auto flex items-center gap-1.5 rounded-full border-dashed border-muted-foreground bg-transparent px-4 py-2 text-[13px] text-muted-foreground"
        >
          <Plus className="size-3.5" />
          {t("search.newShelf")}
        </Button>
      )}
    </div>
  );
}
