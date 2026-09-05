import React, { useEffect, useState } from 'react'
import { getDashboardKPIs, getScoreDistribution, getSkillDemand, getRecruitmentFunnel, getJobMetrics } from '@/api/analytics'
import { DashboardKPIs } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatCard } from '@/components/common/StatCard'
import { Users, Briefcase, TrendingUp, Award, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

export const AnalyticsPage: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [dist, setDist] = useState<any[]>([])
  const [demand, setDemand] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any[]>([])
  const [jobMetrics, setJobMetrics] = useState<any[]>([])

  useEffect(() => {
    getDashboardKPIs().then(setKpis)
    getScoreDistribution().then(data => setDist(data || []))
    getSkillDemand().then(data => setDemand(data || []))
    getRecruitmentFunnel().then(data => setFunnel(data || []))
    getJobMetrics().then(data => setJobMetrics(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          Recruitment Analytics & Insights
        </h1>
        <p className="text-xs text-sage-muted">Holistic performance metrics, applicant conversions, and market intelligence</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Evaluated" value={kpis?.total_candidates ?? 15} icon={Users} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Active Campaigns" value={kpis?.active_jobs ?? 5} icon={Briefcase} color="text-champagne bg-champagne/10 border-champagne/20" />
        <StatCard title="Average Score" value={`${kpis?.avg_match_score ?? 74}%`} icon={TrendingUp} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
        <StatCard title="Shortlist Rate" value="38.5%" icon={Award} color="text-sage bg-sage/10 border-sage/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-warm-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Score Range Distribution
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Count of candidates grouped by evaluated match score bracket</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist}>
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#AAB8B1' }} stroke="#151C19" />
                <YAxis tick={{ fontSize: 10, fill: '#AAB8B1' }} stroke="#151C19" />
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
                <Bar dataKey="count" fill="#00B894" radius={[6, 6, 0, 0]}>
                  {dist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === dist.length - 1 ? '#E8C97A' : '#00B894'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Demand */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-warm-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-champagne" />
              Top Technical Skill Demand
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Most demanded competencies across active positions</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demand} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#AAB8B1' }} stroke="#151C19" />
                <YAxis dataKey="skill_name" type="category" width={80} tick={{ fontSize: 10, fill: '#AAB8B1' }} stroke="#151C19" />
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
                <Bar dataKey="demand_count" fill="#8FB9A8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
