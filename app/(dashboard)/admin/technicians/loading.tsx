import { Skeleton } from '@/components/ui/skeleton'

export default function TechniciansLoading() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-80 rounded bg-slate-200" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg bg-slate-200" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Skeleton className="h-9 w-36 rounded-lg bg-slate-200" />
        <Skeleton className="h-9 w-36 rounded-lg bg-slate-200" />
        <Skeleton className="h-9 w-36 rounded-lg bg-slate-200" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="h-11 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded bg-slate-200" />
          <Skeleton className="h-4 w-28 rounded bg-slate-200" />
          <Skeleton className="h-4 w-24 rounded bg-slate-200" />
          <Skeleton className="h-4 w-20 rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100 p-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-1/3">
                <Skeleton className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5 w-full">
                  <Skeleton className="h-4 w-32 rounded bg-slate-200" />
                  <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="space-y-1.5 w-1/4">
                <Skeleton className="h-4 w-28 rounded bg-slate-200" />
                <Skeleton className="h-3 w-32 rounded bg-slate-100" />
              </div>
              <div className="w-1/6">
                <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
