import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: string
  color?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'text-emerald bg-emerald-500/10 border-emerald-500/20'
}) => {
  return (
    <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card hover:border-emerald-500/30 transition-all">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-sage-muted uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-bold text-warm-white tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-sage-muted">{subtitle}</p>}
          {trend && <span className="text-xs font-semibold text-emerald">{trend}</span>}
        </div>
        <div className={`p-3 rounded-xl border ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  )
}
