interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer rounded-xl bg-gray-100 ${className}`}
        />
      ))}
    </>
  );
}

export function SkeletonHero() {
  return (
    <div className="px-4 pt-5 pb-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-5 w-48 mb-3" />
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-16 w-28 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-14 w-14 rounded-2xl" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-3 w-36" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl mt-4" />
    </div>
  );
}

export function SkeletonHourlyRow() {
  return (
    <div className="px-4 mt-2">
      <Skeleton className="h-3 w-24 mb-2" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[72px] rounded-2xl p-2.5 text-center">
            <Skeleton className="h-3 w-10 mx-auto mb-2" />
            <Skeleton className="h-5 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-6 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards() {
  return (
    <div className="px-4 mt-3 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
