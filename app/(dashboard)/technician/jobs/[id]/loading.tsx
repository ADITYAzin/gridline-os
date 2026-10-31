import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TechnicianJobDetailLoading() {
  return (
    <div className="space-y-3 pb-24">
      {/* Native Top Sub-Screen Bar Skeleton */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <Skeleton className="h-9 w-24 rounded-[8px]" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Header Info Card Skeleton */}
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="p-4 pt-3 space-y-3 border-t border-[#F1F5F9]">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Skeleton className="h-10 w-full rounded-[8px]" />
            <Skeleton className="h-10 w-full rounded-[8px]" />
          </div>
        </CardContent>
      </Card>

      {/* Execution Steps Skeleton */}
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-2 space-y-1.5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-60" />
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2.5">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Photo Documentation Skeleton */}
      <Card className="shadow-xs rounded-[12px] bg-white border-[#E2E8F0]">
        <CardHeader className="p-4 pb-2 space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-52" />
        </CardHeader>
        <CardContent className="p-4 pt-2 grid grid-cols-2 gap-2.5">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
