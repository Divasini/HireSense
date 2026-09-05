import React, { useEffect, useState } from 'react'
import { getJobs } from '@/api/jobs'
import { Job } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Eye, Briefcase } from 'lucide-react'

export const JobManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    getJobs().then(data => setJobs(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          Global Job Management
        </h1>
        <p className="text-xs text-sage-muted">Monitor all recruitment listings across organization recruiters</p>
      </div>

      <div className="rounded-xl border border-emerald-500/10 bg-charcoal shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-charcoal-light/80">
            <TableRow className="border-b border-emerald-500/10">
              <TableHead className="text-xs text-sage-muted">Job Title</TableHead>
              <TableHead className="text-xs text-sage-muted">Company</TableHead>
              <TableHead className="text-xs text-sage-muted">Location</TableHead>
              <TableHead className="text-xs text-sage-muted">Status</TableHead>
              <TableHead className="text-right text-xs text-sage-muted">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(j => (
              <TableRow key={j.id} className="hover:bg-emerald-500/[0.03] border-b border-emerald-500/10">
                <TableCell className="font-semibold text-xs text-warm-white">{j.title}</TableCell>
                <TableCell className="text-xs text-sage">{j.company}</TableCell>
                <TableCell className="text-xs text-sage-muted">{j.location}</TableCell>
                <TableCell><StatusBadge status={j.status} /></TableCell>
                <TableCell className="text-right">
                  <Link to={`/recruiter/jobs/${j.id}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                      <Eye className="w-3 h-3" /> View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
