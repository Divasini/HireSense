import React, { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getNotifications, markAllAsRead } from '@/api/notifications'
import { Notification } from '@/types'

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotes = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.is_read).length)
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleMarkAll = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-sage-muted hover:text-warm-white hover:bg-charcoal-light rounded-xl">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2 bg-charcoal border-obsidian-border text-warm-white shadow-obsidian-card">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sage">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="text-xs text-emerald hover:underline flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-obsidian-border" />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-2.5 rounded-lg text-xs transition-colors ${
                  n.is_read ? 'text-sage-muted bg-transparent' : 'text-warm-white bg-charcoal-light border border-obsidian-border font-medium'
                }`}
              >
                <div className="font-semibold text-warm-white">{n.title}</div>
                <div className="text-[11px] text-sage-muted mt-0.5">{n.message}</div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-sage-muted">No unread alerts</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
