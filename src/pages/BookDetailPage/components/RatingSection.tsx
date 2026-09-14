import { Star, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

const STARS = [1, 2, 3, 4, 5];

export function RatingSection({
  rating,
  canRate,
  onRate,
}: {
  rating: number | null;
  canRate: boolean;
  onRate: (rating: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-foreground">
          {t("bookDetail.rating")}
        </span>
        {!canRate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Lock className="size-3.5" />
            <span className="text-[11px]">{t("bookDetail.ratingLockedHint")}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {STARS.map((star) => (
          <button
            key={star}
            disabled={!canRate}
            onClick={() => canRate && onRate(star)}
            className="transition-transform active:scale-110 disabled:cursor-default"
          >
            <Star
              className={`size-7 ${
                rating !== null && star <= rating
                  ? "fill-primary text-primary"
                  : "text-border"
              } ${!canRate ? "opacity-40" : ""}`}
            />
          </button>
        ))}
        {rating && <span className="ml-1 text-[13px] text-muted-foreground">{rating} / 5</span>}
      </div>

      {!canRate && (
        <p className="text-[12px] text-muted-foreground">{t("bookDetail.ratingLockedNote")}</p>
      )}
    </div>
  );
}
