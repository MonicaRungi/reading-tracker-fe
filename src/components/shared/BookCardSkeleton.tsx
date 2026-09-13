export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-2/3 animate-pulse rounded-xl bg-muted" />
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  )
}
