import React, { useEffect, useState } from 'react'
import { getNotifications, markAllAsRead, markAsRead } from '@/api/notifications'
import { Notification } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck, Sparkles, FileText, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotes = () => {
    getNotifications().then(data => setNotifications(data || []))
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleMarkAll = async () => {
    await markAllAsRead()
    toast.success('All notifications marked as read')
    fetchNotes()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            Notifications
          </h1>
          <p className="text-xs text-sage-muted">System updates, screening completions, and candidate milestones</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleMarkAll} className="gap-1.5 text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
          <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <Card key={n.id} className={`border transition-all ${n.is_read ? 'border-emerald-500/10 bg-charcoal' : 'border-emerald-500/30 bg-charcoal-light/90 shadow-md shadow-emerald-950/20'}`}>
            <CardContent className="p-4 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-warm-white">{n.title}</h4>
                <p className="text-xs text-sage-muted leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-sage font-mono block pt-1">{new Date(n.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
