import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sliders, Save, Key, Bell, Shield, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export const CandidateSettingsPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [jobMatchAlerts, setJobMatchAlerts] = useState(true)

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    toast.success('Password updated successfully!')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSavePreferences = () => {
    toast.success('Notification preferences updated!')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-emerald-400" />
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-sage-muted">Manage your password, alert preferences, and account security</p>
      </div>

      {/* Security */}
      <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-semibold text-sage-muted">Current Password</Label>
              <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="h-9 text-xs bg-charcoal-light border-emerald-500/20 text-warm-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-sage-muted">New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="h-9 text-xs bg-charcoal-light border-emerald-500/20 text-warm-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-sage-muted">Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="h-9 text-xs bg-charcoal-light border-emerald-500/20 text-warm-white" />
            </div>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" /> Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-charcoal-light border border-emerald-500/10 cursor-pointer">
            <div>
              <span className="font-semibold text-warm-white block">Email Application Updates</span>
              <span className="text-[11px] text-sage-muted">Receive alerts when recruiters change your screening or interview stage</span>
            </div>
            <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-charcoal-light border border-emerald-500/10 cursor-pointer">
            <div>
              <span className="font-semibold text-warm-white block">High Match Job Alerts</span>
              <span className="text-[11px] text-sage-muted">Notify when new openings with &gt;85% match score are posted</span>
            </div>
            <input type="checkbox" checked={jobMatchAlerts} onChange={e => setJobMatchAlerts(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
          </label>

          <Button onClick={handleSavePreferences} className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs">
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
