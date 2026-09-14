import { useTranslation } from "react-i18next";
import { SegmentedToggle } from "@/components/shared/SegmentedToggle";
import type { ActivityView, ChartPoint } from "../hooks/useProfileData";
import { BarChart } from "./BarChart";

export function ActivitySection({
  view,
  onViewChange,
  data,
  total,
}: {
  view: ActivityView;
  onViewChange: (view: ActivityView) => void;
  data: ChartPoint[];
  total: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-foreground">
          {t("profile.activity")}
        </h2>
        <SegmentedToggle
          size="sm"
          value={view}
          onChange={onViewChange}
          className="w-auto"
          options={[
            { value: "day", label: t("profile.day") },
            { value: "week", label: t("profile.week") },
          ]}
        />
      </div>

      <p className="text-[12px] text-muted-foreground">
        {view === "day"
          ? t("profile.activityThisWeek", { count: total })
          : t("profile.activityLast6Weeks", { count: total })}
      </p>

      <BarChart data={data} />
    </div>
  );
}
