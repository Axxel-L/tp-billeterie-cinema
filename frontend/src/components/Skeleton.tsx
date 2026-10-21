interface Props {
  className?: string;
}

export function Skeleton({ className = "" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-xl bg-white/[0.07] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-32 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-14 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
