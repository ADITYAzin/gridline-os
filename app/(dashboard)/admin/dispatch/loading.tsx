import { Skeleton } from '@/components/ui/skeleton'

export default function DispatchLoading() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-80 rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Dispatch Board Grid / Calendar Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <Skeleton className="h-6 w-40 rounded bg-slate-200" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded bg-slate-200" />
            <Skeleton className="h-8 w-20 rounded bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
              <Skeleton className="h-5 w-32 rounded bg-slate-200" />
              <Skeleton className="h-24 w-full rounded-lg bg-white border border-slate-200" />
              <Skeleton className="h-24 w-full rounded-lg bg-white border border-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
