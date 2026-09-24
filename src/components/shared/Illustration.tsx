import { cn } from "@/lib/utils";

export type IllustrationName =
  | "book"
  | "books"
  | "open-book"
  | "reading-list"
  | "search"
  | "barcode"
  | "add-book"
  | "calendar"
  | "target"
  | "pages"
  | "flag"
  | "star"
  | "stats"
  | "trophy";

const SOURCES = import.meta.glob<string>("/src/assets/illustrations/*.png", {
  eager: true,
  import: "default",
});

function source(name: string): string {
  return SOURCES[`/src/assets/illustrations/${name}.png`];
}

/** Illustrazione decorativa della palette Shelfy, con variante per il tema scuro. */
export function Illustration({
  name,
  className,
}: {
  name: IllustrationName;
  className?: string;
}) {
  return (
    <>
      <img
        src={source(name)}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={cn("shrink-0 select-none object-contain dark:hidden", className)}
      />
      <img
        src={source(`${name}-dark`)}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={cn("hidden shrink-0 select-none object-contain dark:block", className)}
      />
    </>
  );
}
