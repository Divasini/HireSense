import React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface SkillGapProps {
  matched: string[]
  missing: string[]
}

export const SkillGapChart: React.FC<SkillGapProps> = ({ matched, missing }) => {
  const total = matched.length + missing.length
  const coverage = total > 0 ? Math.round((matched.length / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3.5 bg-charcoal rounded-xl border border-obsidian-border">
        <span className="text-xs font-semibold text-sage-muted uppercase tracking-wider">Skill Coverage Ratio</span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 bg-obsidian-border rounded-full overflow-hidden">
            <div className="h-full bg-emerald rounded-full transition-all duration-500" style={{ width: `${coverage}%` }} />
          </div>
          <span className="text-sm font-bold text-emerald">{coverage}%</span>
          <span className="text-xs text-sage-muted">({matched.length}/{total})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Required Skills */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-charcoal/80 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald" />
            Matched Skills ({matched.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matched.length > 0 ? (
              matched.map((s, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-sage-muted italic">No direct required skills matched</span>
            )}
          </div>
        </div>

        {/* Missing Skills / Gaps */}
        <div className="p-4 rounded-xl border border-coral/20 bg-charcoal/80 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-coral-light flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-coral" />
            Identified Skill Gaps ({missing.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missing.length > 0 ? (
              missing.map((s, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-coral/10 text-coral-light border border-coral/25">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-400 font-medium">All required skills fully satisfied! ✦</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
