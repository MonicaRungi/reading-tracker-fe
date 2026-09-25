import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GenreShare } from "@/api/stats";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GenreRow } from "./GenreRow";

const VISIBLE_GENRES = 5;

export function GenresSection({ genres }: { genres: GenreShare[] }) {
  const { t } = useTranslation();
  const top = genres.slice(0, VISIBLE_GENRES);
  const rest = genres.slice(VISIBLE_GENRES);

  return (
    <div className="space-y-3">
      <h2 className="text-[17px] font-bold text-foreground">
        {t("profile.genres")}
      </h2>

      <Collapsible className="space-y-3">
        {top.map((g) => (
          <GenreRow key={g.genre} genre={g} />
        ))}

        {rest.length > 0 && (
          <>
            <CollapsibleContent className="space-y-3 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              {rest.map((g) => (
                <GenreRow key={g.genre} genre={g} />
              ))}
            </CollapsibleContent>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="group h-auto w-full gap-1 rounded-xl bg-transparent py-2.5 text-[14px] font-medium text-primary hover:bg-transparent hover:text-primary aria-expanded:bg-transparent aria-expanded:text-primary dark:hover:bg-transparent"
              >
                <span className="group-data-[state=open]:hidden">
                  {t("profile.genresShowAll", { count: genres.length })}
                </span>
                <span className="hidden group-data-[state=open]:inline">
                  {t("profile.genresShowLess")}
                </span>
                <ChevronDown
                  className="size-4 transition-transform group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          </>
        )}
      </Collapsible>
    </div>
  );
}
