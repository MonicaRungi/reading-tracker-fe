import { useTranslation } from "react-i18next";
import { SegmentedToggle } from "@/components/shared/SegmentedToggle";
import type { BooksView, ChartPoint } from "../hooks/useProfileData";
import { BarChart } from "./BarChart";

export function BooksReadSection({
  view,
  onViewChange,
  data,
}: {
  view: BooksView;
  onViewChange: (view: BooksView) => void;
  data: ChartPoint[];
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-foreground">
          {t("profile.booksRead")}
        </h2>
        <SegmentedToggle
          size="sm"
          value={view}
          onChange={onViewChange}
          className="w-auto"
          options={[
            { value: "year", label: t("profile.year") },
            { value: "month", label: t("profile.month") },
          ]}
        />
      </div>

      <BarChart data={data} />
    </div>
  );
}
