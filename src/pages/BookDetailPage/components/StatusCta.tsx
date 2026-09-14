import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { ReadingStatus } from "@/api/library";

export function StatusCta({
  status,
  isUpdating,
  onAdvance,
}: {
  status: string;
  isUpdating: boolean;
  onAdvance: (nextStatus: ReadingStatus) => void;
}) {
  const { t } = useTranslation();

  if (status !== "to_read" && status !== "reading") return null;

  const nextStatus: ReadingStatus = status === "to_read" ? "reading" : "read";
  const label = status === "to_read" ? t("bookDetail.startReading") : t("bookDetail.finishReading");

  return (
    <Button
      disabled={isUpdating}
      onClick={() => onAdvance(nextStatus)}
      className="h-auto w-full rounded-2xl py-4 text-[15px] font-medium disabled:opacity-60"
    >
      {isUpdating ? t("common.loading") : label}
    </Button>
  );
}
