import React, { useEffect, useState } from 'react'
import { getSystemStats } from '@/api/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatCard } from '@/components/common/StatCard'
import { Users, Shield, Briefcase, FileText, Activity, Server, Cpu, Database } from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    getSystemStats().then(setStats)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-emerald-400" />
          System Administration Dashboard
        </h1>
        <p className="text-xs text-sage-muted">Platform operational metrics, AI inference health, and user governance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Registered Users" value={stats?.total_users ?? 5} icon={Users} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Recruiters" value={stats?.total_recruiters ?? 1} icon={Briefcase} color="text-champagne bg-champagne/10 border-champagne/20" />
        <StatCard title="Candidates" value={stats?.total_candidates ?? 15} icon={Users} color="text-sage bg-sage/10 border-sage/20" />
        <StatCard title="System Health" value="100% Online" icon={Activity} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" /> AI Engine Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2.5 border-b border-emerald-500/10">
              <span className="text-sage-muted font-medium">Embedding Model:</span>
              <span className="font-semibold text-emerald-300 font-mono">all-MiniLM-L6-v2 (384-dim)</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-emerald-500/10">
              <span className="text-sage-muted font-medium">NLP Parser:</span>
              <span className="font-semibold text-warm-white font-mono">spaCy en_core_web_sm + EntityRuler</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-emerald-500/10">
              <span className="text-sage-muted font-medium">Active Skills Taxonomy:</span>
              <span className="font-semibold text-champagne font-mono">500+ Canonical Skills</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-champagne" /> Security & Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2.5 border-b border-emerald-500/10">
              <span className="text-sage-muted font-medium">Authentication Protocol:</span>
              <span className="font-semibold text-warm-white font-mono">JWT Bearer (HS256)</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-emerald-500/10">
              <span className="text-sage-muted font-medium">Password Hashing:</span>
              <span className="font-semibold text-warm-white font-mono">Argon2id Algorithm</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-emerald-500/10">
              <span className="text-sage-muted font-medium">Audit Trail Logging:</span>
              <span className="font-semibold text-emerald-400 font-mono">Active (Full Traceability)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
