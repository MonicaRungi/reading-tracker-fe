import { useTranslation } from "react-i18next";
import { GoodreadsIcon } from "@/components/shared/GoodreadsIcon";
import { StoryGraphIcon } from "@/components/shared/StoryGraphIcon";
import { Button } from "@/components/ui/button";

export type ImportSource = "goodreads" | "storygraph";

const SOURCE_ICONS: Record<
  ImportSource,
  (props: { className?: string }) => React.JSX.Element
> = {
  goodreads: GoodreadsIcon,
  storygraph: StoryGraphIcon,
};

export function ImportButton({
  onClick,
  source,
}: {
  onClick: () => void;
  source: ImportSource;
}) {
  const { t } = useTranslation();
  const Icon = SOURCE_ICONS[source];

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex w-full justify-start gap-3 rounded-xl border border-border px-6 py-7 text-[15px] text-muted-foreground active:bg-secondary"
    >
      <Icon className="size-5" />
      {t(`import.${source}`)}
    </Button>
  );
}
