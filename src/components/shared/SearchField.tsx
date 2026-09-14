import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        className="h-auto border-0 bg-transparent p-0 text-base shadow-none placeholder:text-hint focus-visible:ring-0 md:text-[14px]"
      />
    </div>
  );
}
