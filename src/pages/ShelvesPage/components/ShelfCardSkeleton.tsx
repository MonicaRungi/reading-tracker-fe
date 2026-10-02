export function ShelfCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="h-[104px] animate-pulse bg-muted" />
      <div className="space-y-1.5 px-4 py-3">
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
