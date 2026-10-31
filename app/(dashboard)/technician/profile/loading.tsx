import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TechnicianProfileLoading() {
  return (
    <div className="space-y-4 pb-6">
      {/* Header Skeleton */}
      <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Skeleton className="h-9 w-9 shrink-0 rounded-[8px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </header>

      {/* Avatar Card Skeleton */}
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardContent className="p-5 flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Info Rows Skeleton */}
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
