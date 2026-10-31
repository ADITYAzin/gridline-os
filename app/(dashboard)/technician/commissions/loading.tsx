import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TechnicianCommissionsLoading() {
  return (
    <div className="space-y-4 pb-4">
      {/* Native Tab Screen Header Skeleton */}
      <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Skeleton className="h-9 w-9 shrink-0 rounded-[8px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </header>

      {/* Hero Earnings Banner Skeleton */}
      <Card className="rounded-[12px] overflow-hidden border-[#E2E8F0]">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9]">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* 3 Metric Cards Skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-xs rounded-[10px] p-2.5 text-center bg-white border-[#E2E8F0] space-y-1.5">
            <Skeleton className="h-4 w-4 mx-auto rounded-full" />
            <Skeleton className="h-5 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </Card>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-xs rounded-[10px] bg-white border-[#E2E8F0]">
            <CardContent className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
