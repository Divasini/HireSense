import React from 'react'

interface SkillBadgeProps {
  skill: string
  status?: 'matched' | 'missing' | 'neutral'
  className?: string
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  status = 'neutral',
  className = ''
}) => {
  let style = 'bg-charcoal-light text-sage border-obsidian-border'

  if (status === 'matched') {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  } else if (status === 'missing') {
    style = 'bg-coral/15 text-coral-light border-coral/30'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${style} ${className}`}>
      {skill}
    </span>
  )
}
