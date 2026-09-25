import {
  Illustration,
  type IllustrationName,
} from "@/components/shared/Illustration";

export function FeatureListItem({
  illustration,
  title,
  description,
}: {
  illustration: IllustrationName;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Illustration name={illustration} className="size-12" />
      <div>
        <p className="font-semibold leading-5 text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
