import React from 'react'

interface BreakdownProps {
  scores: {
    skills?: number
    experience?: number
    education?: number
    projects?: number
    certifications?: number
  }
}

export const ScoreBreakdown: React.FC<BreakdownProps> = ({ scores }) => {
  const items = [
    { label: 'Skills Match', weight: '40%', value: scores.skills ?? 0, color: '#00B894' },
    { label: 'Experience Relevance', weight: '25%', value: scores.experience ?? 0, color: '#8FB9A8' },
    { label: 'Education Alignment', weight: '15%', value: scores.education ?? 0, color: '#E8C97A' },
    { label: 'Project Relevance', weight: '10%', value: scores.projects ?? 0, color: '#54DCBD' },
    { label: 'Certifications', weight: '10%', value: scores.certifications ?? 0, color: '#AAB8B1' },
  ]

  return (
    <div className="space-y-3.5">
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-sage-muted">
              {item.label} <span className="text-slate-500 text-[10px]">({item.weight})</span>
            </span>
            <span className="font-semibold text-warm-white">{Math.round(item.value)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-obsidian-border">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, item.value))}%`,
                backgroundColor: item.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
