import React, { useEffect, useState } from 'react'
import { getJobs } from '@/api/jobs'
import { getSkillDemand } from '@/api/analytics'
import { Job } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle2, AlertTriangle, Lightbulb, Compass, Zap, Target } from 'lucide-react'

export const SkillGapPage: React.FC = () => {
  const [demand, setSkillDemand] = useState<any[]>([])
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    getSkillDemand().then(data => setSkillDemand(data || []))
    getJobs().then(data => setJobs(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Target className="w-6 h-6 text-emerald-400" />
          Skill Gap & Demand Intelligence
        </h1>
        <p className="text-xs text-sage-muted">Enterprise skill distribution, candidate market gaps, and requirements coverage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Highest In-Demand Competencies
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Frequency of skill mentions across all active job postings</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demand} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#AAB8B1' }} stroke="#151C19" />
                <YAxis dataKey="skill_name" type="category" width={90} tick={{ fontSize: 10, fill: '#AAB8B1' }} stroke="#151C19" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151C19',
                    borderColor: 'rgba(0, 184, 148, 0.2)',
                    color: '#F5F3EA',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'rgba(0, 184, 148, 0.05)' }}
                />
                <Bar dataKey="demand_count" fill="#00B894" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-champagne" />
              Recruitment Market Insights
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Autonomous hiring recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-warm-white/90 leading-relaxed">
                <strong className="text-emerald-300 font-semibold">Python & SQL</strong> are present in 90% of candidate profiles with high qualification coverage.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-warm-white/90 leading-relaxed">
                <strong className="text-amber-300 font-semibold">Docker & AWS Orchestration</strong> are the most frequent skill gaps among Junior-to-Mid applicants.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-champagne/10 border border-champagne/20 flex items-start gap-3">
              <Compass className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
              <p className="text-warm-white/90 leading-relaxed">
                Candidates with machine learning portfolio projects achieve an average of <strong className="text-champagne font-semibold">18% higher screening scores</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
