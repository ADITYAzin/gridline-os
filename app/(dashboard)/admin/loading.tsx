import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-96 max-w-full rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-lg bg-slate-200" />
          <Skeleton className="h-10 w-28 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 rounded bg-slate-200" />
              <Skeleton className="h-4 w-4 rounded-full bg-slate-200" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16 rounded bg-slate-200" />
              <Skeleton className="h-3 w-36 rounded bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Analytics Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-slate-200 p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded bg-slate-200" />
            <Skeleton className="h-3.5 w-60 rounded bg-slate-200" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg bg-slate-100" />
        </Card>
        <Card className="shadow-sm border-slate-200 p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded bg-slate-200" />
            <Skeleton className="h-3.5 w-60 rounded bg-slate-200" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg bg-slate-100" />
        </Card>
      </div>
    </div>
  )
}
