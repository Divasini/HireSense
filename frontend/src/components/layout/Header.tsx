import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { NotificationBell } from '../common/NotificationBell'
import { LogOut, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'

export function Header() {
  const { logout, user } = useAuthStore()

  return (
    <header className="h-16 bg-obsidian border-b border-obsidian-border flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <Sparkles className="w-3 h-3 text-emerald" />
          HireSense Intelligence Engine Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-6 w-[1px] bg-obsidian-border mx-1"></div>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-medium text-sage-muted hover:text-coral hover:bg-coral/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  )
}
