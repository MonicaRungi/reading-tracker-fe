import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-3">
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        className="h-auto border-0 bg-transparent px-1 py-0 text-base shadow-none placeholder:text-hint focus-visible:ring-0 md:text-[14px] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onChange("")}
          aria-label={t("common.clear")}
          className="-my-1 -mr-1 rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
