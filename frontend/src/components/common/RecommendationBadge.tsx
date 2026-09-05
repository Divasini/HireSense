import React from 'react'

interface BadgeProps {
  recommendation: string
}

export const RecommendationBadge: React.FC<BadgeProps> = ({ recommendation }) => {
  const norm = (recommendation || '').toLowerCase().replace(/_/g, ' ')
  
  if (norm.includes('strongly') || norm.includes('hire')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
        Strongly Recommended
      </span>
    )
  }
  if (norm.includes('recommended') || norm.includes('interview')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-sage border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Recommended
      </span>
    )
  }
  if (norm.includes('consider')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber"></span>
        Consider for Review
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-coral/15 text-coral-light border border-coral/30">
      <span className="w-1.5 h-1.5 rounded-full bg-coral"></span>
      Not Recommended
    </span>
  )
}
