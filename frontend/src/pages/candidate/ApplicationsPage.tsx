import React, { useEffect, useState } from 'react'
import { getMyApplications } from '@/api/candidates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Briefcase, Building2, MapPin, Clock, ArrowRight, Mic } from 'lucide-react'
import { Link } from 'react-router-dom'

export const ApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyApplications().then(setApps).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          My Applications
        </h1>
        <p className="text-xs text-sage-muted">Track your job applications and access tailored interview preparation</p>
      </div>

      <div className="space-y-3.5">
        {apps.map(a => (
          <Card key={a.id} className="bg-charcoal border-emerald-500/15 hover:border-emerald-500/30 shadow-xl transition-all">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-warm-white text-base">{a.job_title}</h3>
                <p className="text-xs text-sage flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sage-muted" />
                  {a.company} • {a.location}
                </p>
                <span className="text-[11px] text-sage-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Applied on {new Date(a.applied_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 font-mono block">
                    {Math.round(a.match_score)}% Match
                  </span>
                </div>
                <StatusBadge status={a.status || 'Applied'} />

                <Link to={`/candidate/interview-prep?jobId=${a.job_id}`}>
                  <Button size="sm" className="bg-champagne hover:bg-champagne-light text-obsidian font-bold text-xs h-8 px-3 gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Start Interview Prep
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {apps.length === 0 && (
          <Card className="bg-charcoal border-emerald-500/10 p-8 text-center space-y-4">
            <Briefcase className="w-10 h-10 text-sage-muted mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-warm-white text-base">No job applications found</h3>
              <p className="text-xs text-sage-muted max-w-sm mx-auto">
                Apply for a job position to unlock tailored AI Interview Preparation and mock speech sessions.
              </p>
            </div>
            <Link to="/candidate/recommended-jobs">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs gap-1.5">
                Explore Jobs <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
