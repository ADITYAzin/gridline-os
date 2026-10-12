import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function JobDetailLoading() {
  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      {/* Top Navigation & Status Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md bg-slate-200" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32 rounded bg-slate-200" />
              <Skeleton className="h-5 w-20 rounded-full bg-slate-200" />
              <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
            </div>
            <Skeleton className="h-4 w-48 rounded bg-slate-100" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg bg-slate-200" />
          <Skeleton className="h-9 w-28 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Job Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 space-y-2">
              <Skeleton className="h-5 w-36 rounded bg-slate-200" />
              <Skeleton className="h-4 w-64 rounded bg-slate-100" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-lg bg-slate-100" />
                <Skeleton className="h-16 w-full rounded-lg bg-slate-100" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg bg-slate-100" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40 rounded bg-slate-200" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded bg-slate-200" />
                  <Skeleton className="h-4 w-full rounded bg-slate-100" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Assignment & Customer */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 rounded bg-slate-200" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="space-y-1 w-full">
                  <Skeleton className="h-4 w-28 rounded bg-slate-200" />
                  <Skeleton className="h-3 w-36 rounded bg-slate-100" />
                </div>
              </div>
              <Skeleton className="h-9 w-full rounded-lg bg-slate-200" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-28 rounded bg-slate-200" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-32 rounded bg-slate-200" />
              <Skeleton className="h-3 w-28 rounded bg-slate-100" />
              <Skeleton className="h-12 w-full rounded bg-slate-100" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
