import { Bookmark, BookOpen, Check, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ReadingStatus } from "@/api/library";

const STATUSES: { key: ReadingStatus; icon: React.ReactNode }[] = [
  { key: "to_read", icon: <Bookmark className="size-5" /> },
  { key: "reading", icon: <BookOpen className="size-5" /> },
  { key: "read", icon: <Check className="size-5" /> },
  { key: "abandoned", icon: <XCircle className="size-5" /> },
];

export function ReadingStatusPicker({
  value,
  onChange,
}: {
  value: ReadingStatus;
  onChange: (value: ReadingStatus | "") => void;
}) {
  const { t } = useTranslation();

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={onChange}
      className="mb-5 grid w-full grid-cols-4 gap-2"
    >
      {STATUSES.map((s) => (
        <ToggleGroupItem
          key={s.key}
          value={s.key}
          className="flex h-auto flex-col items-center gap-2 rounded-xl border border-transparent bg-secondary py-3 text-[11px] font-medium text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-primary"
        >
          {s.icon}
          <span className="text-center leading-tight">{t(`status.${s.key}`)}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
