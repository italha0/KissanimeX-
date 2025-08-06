export function AnimeCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-muted rounded-lg mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    </div>
  )
}

export function AnimeGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function AnimeDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <section className="relative h-[60vh] bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="relative container h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-[300px] h-[450px] bg-muted/50 rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-muted/50 rounded w-2/3"></div>
              <div className="h-6 bg-muted/50 rounded w-1/2"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-muted/50 rounded w-20"></div>
                <div className="h-4 bg-muted/50 rounded w-16"></div>
                <div className="h-4 bg-muted/50 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="container py-12">
        <div className="space-y-8">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
