import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 dark:bg-dark-cardSecondary/80',
        className
      )}
    />
  )
}

export const KpiCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-8 w-8 rounded-xl" />
    </div>
    <div className="mt-4 flex items-end justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-9 w-16 rounded-lg" />
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-dark-border/60">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
)

export const ChartCardSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
    <div className="flex items-center justify-between pb-4">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-lg" />
    </div>
    <Skeleton className={cn('w-full rounded-xl', height)} />
  </div>
)

export const TableRowsSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 6,
}) => (
  <>
    {Array.from({ length: rows }).map((_, rIdx) => (
      <tr key={rIdx} className="border-b border-slate-100 dark:border-dark-border/60">
        {Array.from({ length: cols }).map((__, cIdx) => (
          <td key={cIdx} className="px-5 py-3.5">
            {cIdx === 0 ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-36" />
                </div>
              </div>
            ) : (
              <Skeleton className="h-3.5 w-20" />
            )}
          </td>
        ))}
      </tr>
    ))}
  </>
)
