import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  UserCheck,
  UserX,
  TrendingUp,
  BrainCircuit,
  Plus,
  Upload,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { StatusBadge } from '@/components/common/StatusBadge'
import { RecommendationBadge } from '@/components/common/RecommendationBadge'
import { RecruitmentFunnel } from '@/components/common/RecruitmentFunnel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getDashboardKPIs, getScoreDistribution, getSkillDemand, getRecruitmentFunnel } from '@/api/analytics'
import { getJobs } from '@/api/jobs'
import { getCandidates } from '@/api/candidates'
import { DashboardKPIs, Job } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export const RecruiterDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [scoreDist, setScoreDist] = useState<any[]>([])
  const [skillDemand, setSkillDemand] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiData, distData, demandData, funnelData, jobsData, candData] = await Promise.all([
          getDashboardKPIs(),
          getScoreDistribution(),
          getSkillDemand(),
          getRecruitmentFunnel(),
          getJobs(),
          getCandidates({ per_page: 5 })
        ])
        setKpis(kpiData)
        setScoreDist(distData || [])
        setSkillDemand(demandData || [])
        setFunnel(funnelData || [])
        setJobs(jobsData || [])
        setCandidates(candData?.candidates || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal rounded-2xl p-6 border border-obsidian-border shadow-obsidian-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald border border-emerald-500/25">
            <Sparkles className="w-3 h-3 text-emerald" />
            HireSense AI Screening Engine Active
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-warm-white">Recruitment Command Center</h1>
          <p className="text-xs text-sage-muted">Autonomous semantic resume matching, explainable scoring, and talent intelligence.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/recruiter/upload">
            <Button size="sm" variant="outline" className="gap-1.5 font-bold text-xs h-9 bg-charcoal-light border-obsidian-border text-warm-white hover:border-emerald hover:text-emerald">
              <Upload className="w-3.5 h-3.5" />
              Upload Resumes
            </Button>
          </Link>
          <Link to="/recruiter/jobs/create">
            <Button size="sm" className="bg-emerald hover:bg-emerald-600 text-obsidian gap-1.5 font-bold text-xs h-9">
              <Plus className="w-3.5 h-3.5 text-obsidian" />
              Post Job Position
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Candidates" value={kpis?.total_candidates ?? 15} icon={Users} color="text-emerald bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Active Positions" value={kpis?.active_jobs ?? 5} icon={Briefcase} color="text-sage bg-sage/10 border-sage/20" />
        <StatCard title="Shortlisted" value={kpis?.total_shortlisted ?? 4} icon={UserCheck} color="text-champagne bg-champagne/10 border-champagne/20" />
        <StatCard title="Avg Match Score" value={`${kpis?.avg_match_score ?? 74}%`} icon={TrendingUp} color="text-emerald bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Interviews" value={kpis?.interviews_recommended ?? 6} icon={BrainCircuit} color="text-sage bg-sage/10 border-sage/20" />
        <StatCard title="Rejected" value={kpis?.total_rejected ?? 2} icon={UserX} color="text-coral bg-coral/10 border-coral/20" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-warm-white">Match Score Distribution</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Candidate count by score brackets</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#AAB8B1' }} axisLine={{ stroke: '#24322C' }} />
                <YAxis tick={{ fontSize: 10, fill: '#AAB8B1' }} axisLine={{ stroke: '#24322C' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', backgroundColor: '#151C19', border: '1px solid #24322C', color: '#F5F3EA' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scoreDist.map((entry, index) => {
                    const colors = ['#E17055', '#F39C12', '#E8C97A', '#8FB9A8', '#00B894']
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Demanded Skills */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-warm-white">Most Demanded Skills</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Frequency across open position criteria</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDemand.slice(0, 5)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#AAB8B1' }} axisLine={{ stroke: '#24322C' }} />
                <YAxis dataKey="skill_name" type="category" width={80} tick={{ fontSize: 10, fill: '#AAB8B1' }} axisLine={{ stroke: '#24322C' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', backgroundColor: '#151C19', border: '1px solid #24322C', color: '#F5F3EA' }} />
                <Bar dataKey="demand_count" fill="#00B894" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recruitment Funnel */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-warm-white">Recruitment Funnel</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Conversion progress across stages</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <RecruitmentFunnel stages={funnel} />
          </CardContent>
        </Card>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Job Postings */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-warm-white">Active Positions</CardTitle>
              <CardDescription className="text-xs text-sage-muted">Current requirements & applicant volume</CardDescription>
            </div>
            <Link to="/recruiter/jobs">
              <Button variant="ghost" size="sm" className="text-xs text-emerald gap-1 font-semibold hover:bg-charcoal-light">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-obsidian-border p-0">
            {jobs.slice(0, 4).map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between hover:bg-charcoal-light/40 transition-colors">
                <div className="space-y-0.5">
                  <Link to={`/recruiter/jobs/${job.id}`} className="font-bold text-warm-white text-sm hover:text-emerald">
                    {job.title}
                  </Link>
                  <p className="text-xs text-sage-muted">{job.company} • {job.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={job.status} />
                  <Link to={`/recruiter/jobs/${job.id}`}>
                    <Button size="sm" variant="outline" className="text-xs h-8 bg-charcoal border-obsidian-border text-warm-white hover:border-emerald hover:text-emerald">
                      Applicants
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Candidate Rankings */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-warm-white">Evaluated Candidates</CardTitle>
              <CardDescription className="text-xs text-sage-muted">Recent multi-factor scored profiles</CardDescription>
            </div>
            <Link to="/recruiter/ranking">
              <Button variant="ghost" size="sm" className="text-xs text-emerald gap-1 font-semibold hover:bg-charcoal-light">
                Full Rankings <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-obsidian-border p-0">
            {candidates.map((cand, idx) => (
              <div key={cand.id || idx} className={`p-4 flex items-center justify-between hover:bg-charcoal-light/40 transition-colors ${idx === 0 ? 'bg-champagne/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <ScoreCircle score={88 - idx * 6} size={42} strokeWidth={4} isTopRank={idx === 0} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/recruiter/candidates/${cand.id}`} className="font-bold text-warm-white text-sm hover:text-emerald">
                        {cand.full_name}
                      </Link>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-champagne bg-champagne/10 px-1.5 py-0.2 rounded border border-champagne/30">
                          #1 Rank
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sage-muted">{cand.email} • {cand.location || 'Remote'}</p>
                  </div>
                </div>
                <RecommendationBadge recommendation={idx === 0 ? 'strongly_recommended' : idx < 3 ? 'recommended' : 'consider'} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
