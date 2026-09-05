import React from 'react'

interface StatusProps {
  status: string
}

export const StatusBadge: React.FC<StatusProps> = ({ status }) => {
  const s = (status || '').toLowerCase()
  let style = 'bg-charcoal text-sage-muted border-obsidian-border'

  if (s === 'active' || s === 'shortlisted' || s === 'hired') {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  } else if (s === 'interview' || s === 'screening') {
    style = 'bg-champagne/15 text-champagne border-champagne/30'
  } else if (s === 'rejected' || s === 'closed') {
    style = 'bg-coral/15 text-coral-light border-coral/30'
  } else if (s === 'applied' || s === 'draft') {
    style = 'bg-charcoal-light text-sage border-obsidian-border'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {s.replace(/_/g, ' ')}
    </span>
  )
}
