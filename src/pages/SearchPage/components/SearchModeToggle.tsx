import { useTranslation } from "react-i18next";
import { SegmentedToggle } from "@/components/shared/SegmentedToggle";
import type { SearchTab } from "../hooks/useSearchData";

export function SearchModeToggle({
  value,
  onChange,
}: {
  value: SearchTab;
  onChange: (value: SearchTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <SegmentedToggle
      value={value}
      onChange={onChange}
      options={[
        { value: "search", label: t("search.tabSearch") },
        { value: "scan", label: t("search.tabScan") },
      ]}
    />
  );
}
