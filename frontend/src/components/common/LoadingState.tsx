import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const LoadingState: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-8 w-1/3 bg-charcoal-light" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl bg-charcoal-light" />
      ))}
    </div>
  )
}
