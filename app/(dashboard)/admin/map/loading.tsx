export default function MapLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-md" />
          <div className="h-4 w-80 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-md" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted/40 rounded-xl border border-border/50" />
        ))}
      </div>

      {/* Filter Skeleton */}
      <div className="h-20 bg-muted/40 rounded-xl border border-border/50" />

      {/* Main Map Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        <div className="lg:col-span-4 h-full bg-muted/30 rounded-2xl border border-border/50" />
        <div className="lg:col-span-8 h-full bg-muted/30 rounded-2xl border border-border/50 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  )
}
