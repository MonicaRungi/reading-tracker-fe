import { useTranslation } from "react-i18next";
import { DateBox } from "./DateBox";

export function ReadingDates({
  startedAt,
  finishedAt,
  onTapStarted,
  onTapFinished,
}: {
  startedAt: string | null;
  finishedAt: string | null;
  onTapStarted: () => void;
  onTapFinished: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <DateBox label={t("bookDetail.started")} value={startedAt} onTap={onTapStarted} />
      <DateBox label={t("bookDetail.finished")} value={finishedAt} onTap={onTapFinished} />
    </div>
  );
}
