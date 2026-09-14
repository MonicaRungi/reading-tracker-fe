import { useTranslation } from "react-i18next";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { GenreShare } from "@/api/stats";

export function GenresSection({ genres }: { genres: GenreShare[] }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h2 className="text-[17px] font-bold text-foreground">
        {t("profile.genres")}
      </h2>
      <div className="space-y-3">
        {genres.map((g) => (
          <div key={g.genre} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-foreground">{g.genre}</span>
              <span className="text-[13px] text-muted-foreground">
                {Math.round(g.percent * 100)}%
              </span>
            </div>
            <ProgressBar percent={g.percent * 100} />
          </div>
        ))}
      </div>
    </div>
  );
}
