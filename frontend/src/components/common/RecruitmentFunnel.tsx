import React from 'react'

interface FunnelProps {
  stages: {
    stage: string
    count: number
    percentage: number
  }[]
}

export const RecruitmentFunnel: React.FC<FunnelProps> = ({ stages }) => {
  const colors = [
    'bg-emerald-500',
    'bg-emerald-600',
    'bg-emerald-700',
    'bg-champagne',
    'bg-sage'
  ]

  return (
    <div className="space-y-3">
      {stages.map((st, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-sage-muted">
            <span className="text-warm-white">{st.stage}</span>
            <span>{st.count} ({st.percentage}%)</span>
          </div>
          <div className="h-5 w-full rounded-md bg-charcoal-light overflow-hidden flex items-center border border-obsidian-border">
            <div
              className={`h-full ${colors[idx % colors.length]} flex items-center justify-end pr-2 text-[10px] font-bold text-obsidian transition-all duration-700`}
              style={{ width: `${Math.max(12, st.percentage)}%` }}
            >
              {st.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
