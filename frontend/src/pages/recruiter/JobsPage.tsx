import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '@/api/jobs'
import { Job } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SearchInput } from '@/components/common/SearchInput'
import { Plus, Briefcase, MapPin, Users, ArrowRight, Building2 } from 'lucide-react'

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    getJobs().then(data => setJobs(data || []))
  }, [])

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            Job Positions & Requisitions
          </h1>
          <p className="text-xs text-sage-muted">Manage active campaigns, view candidate pools, and configure AI screening criteria</p>
        </div>
        <Link to="/recruiter/jobs/create">
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-1.5 shadow-lg shadow-emerald-500/10">
            <Plus className="w-4 h-4" />
            Create Position
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search jobs by title or company..." className="w-full sm:w-80" />
        <div className="flex items-center gap-2">
          {['all', 'active', 'closed', 'draft'].map(st => (
            <Button
              key={st}
              variant={statusFilter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className={`capitalize text-xs h-8 ${
                statusFilter === st
                  ? 'bg-emerald-500 text-obsidian font-bold'
                  : 'border-emerald-500/20 text-sage-muted hover:text-warm-white hover:bg-charcoal'
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid of Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(job => (
          <Card key={job.id} className="bg-charcoal border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/20 transition-all group flex flex-col justify-between">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <StatusBadge status={job.status} />
                  <span className="text-[11px] text-sage-muted font-medium bg-charcoal-light/60 px-2 py-0.5 rounded border border-white/5">
                    {job.employment_type || 'Full-time'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-warm-white text-base leading-snug group-hover:text-emerald-300 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs font-medium text-sage mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sage-muted" />
                    {job.company}
                  </p>
                </div>
                <p className="text-xs text-sage-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400/70" />
                  {job.location}
                </p>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.required_skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                        {s}
                      </span>
                    ))}
                    {job.required_skills.length > 3 && (
                      <span className="text-[10px] text-sage-muted px-1 py-0.5">
                        +{job.required_skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-white">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {job.candidate_count ?? 3} Applicants
                </div>
                <Link to={`/recruiter/jobs/${job.id}`}>
                  <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 text-xs">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
