import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sliders, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export const SettingsPage: React.FC = () => {
  const handleSave = () => {
    toast.success('System parameters saved!')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-emerald-400" />
          System Settings
        </h1>
        <p className="text-xs text-sage-muted">Global defaults and screening threshold controls</p>
      </div>

      <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-warm-white">Screening Engine Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="font-semibold text-sage-muted">Default Shortlisting Threshold (%)</Label>
            <Input defaultValue="75" className="h-9 text-xs max-w-xs bg-charcoal-light border-emerald-500/20 text-warm-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="font-semibold text-sage-muted">Maximum Resume Upload Size (MB)</Label>
            <Input defaultValue="10" className="h-9 text-xs max-w-xs bg-charcoal-light border-emerald-500/20 text-warm-white" />
          </div>
          <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-1.5 shadow-md shadow-emerald-500/10">
            <Save className="w-3.5 h-3.5" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
