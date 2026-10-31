import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TechnicianDashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Native Screen Header Skeleton */}
      <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Skeleton className="h-9 w-9 shrink-0 rounded-[8px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </header>

      {/* Hero Priority Job Skeleton */}
      <Card className="border-[#007ACC]/30 bg-white shadow-xs rounded-xl overflow-hidden">
        <div className="bg-[#007ACC]/15 px-3.5 py-2 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Segmented Filter Skeleton */}
      <div className="flex items-center p-1.5 bg-[#F1F5F9] rounded-xl gap-1">
        <Skeleton className="h-10 flex-1 rounded-lg bg-white" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>

      {/* Job List Skeletons */}
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-xs rounded-[10px] bg-white border-[#E2E8F0]">
            <CardHeader className="p-3.5 pb-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="p-3.5 pt-2 space-y-2 border-t border-[#F1F5F9] mt-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-52" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
