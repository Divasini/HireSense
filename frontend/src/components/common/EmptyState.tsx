import React from 'react'
import { LucideIcon, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FileText,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-obsidian-border bg-charcoal/50">
      <div className="p-4 rounded-2xl bg-charcoal-light border border-obsidian-border mb-4 text-emerald">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-warm-white mb-1">{title}</h3>
      <p className="text-xs text-sage-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-emerald hover:bg-emerald-600 text-obsidian font-semibold text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
