import type { GenreShare } from "@/api/stats";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatPercent } from "@/lib/format";

export function GenreRow({ genre }: { genre: GenreShare }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-foreground">{genre.genre}</span>
        <span className="text-[13px] text-muted-foreground">
          {formatPercent(genre.percent)}
        </span>
      </div>
      <ProgressBar percent={genre.percent * 100} />
    </div>
  );
}
