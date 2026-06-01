import { cn } from '@/lib/utils'
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg', className)} />
}
export function BookCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  )
}
