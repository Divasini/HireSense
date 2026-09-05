import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '@/api/jobs'
import { getRanking, shortlistCandidate } from '@/api/screening'
import { Job, RankedCandidate } from '@/types'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RecommendationBadge } from '@/components/common/RecommendationBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SearchInput } from '@/components/common/SearchInput'
import { ExportButton } from '@/components/common/ExportButton'
import { Eye, Check, X, SlidersHorizontal, Scale, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export const CandidateRankingPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [rankings, setRankings] = useState<RankedCandidate[]>([])
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState<number>(0)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getJobs().then(data => {
      setJobs(data || [])
      if (data && data.length > 0) {
        setSelectedJob(data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedJob) return
    setLoading(true)
    getRanking(selectedJob)
      .then(data => setRankings(data || []))
      .finally(() => setLoading(false))
  }, [selectedJob])

  const handleDecision = async (appId: string, decision: string) => {
    try {
      await shortlistCandidate(appId, decision)
      toast.success(`Candidate marked as ${decision}`)
      const updated = await getRanking(selectedJob)
      setRankings(updated || [])
    } catch {
      toast.error('Action failed')
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(x => x !== id))
    } else {
      if (selectedCandidates.length >= 4) {
        toast.error('Maximum 4 candidates can be compared simultaneously')
        return
      }
      setSelectedCandidates([...selectedCandidates, id])
    }
  }

  const filtered = rankings.filter(c => {
    const matchSearch = c.candidate_name.toLowerCase().includes(search.toLowerCase()) || c.candidate_email.toLowerCase().includes(search.toLowerCase())
    const matchScore = c.overall_score >= minScore
    return matchSearch && matchScore
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white">Candidate Ranking & Intelligence</h1>
          <p className="text-xs text-sage-muted">Autonomous semantic evaluation ranked by weighted qualification vectors</p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedCandidates.length > 1 && (
            <Link to={`/recruiter/compare?ids=${selectedCandidates.join(',')}`}>
              <Button size="sm" className="bg-champagne hover:bg-champagne-dark text-obsidian font-bold gap-1.5 text-xs">
                <Scale className="w-3.5 h-3.5 text-obsidian" />
                Compare ({selectedCandidates.length})
              </Button>
            </Link>
          )}
          {selectedJob && <ExportButton jobId={selectedJob} />}
        </div>
      </div>

      {/* Select Position Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-charcoal p-4 rounded-xl border border-obsidian-border shadow-obsidian-card">
        <div className="w-full sm:w-72">
          <label className="text-[10px] font-bold uppercase tracking-wider text-sage-muted block mb-1">Target Job Position</label>
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="w-full h-9 px-3 text-xs font-semibold rounded-md border border-obsidian-border bg-charcoal-light text-warm-white outline-none focus:border-emerald"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id} className="bg-charcoal text-warm-white">
                {j.title} ({j.company})
              </option>
            ))}
          </select>
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder="Filter candidates by name or email..." />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-sage" />
          <span className="text-xs text-sage-muted font-medium">Min Score:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="w-24 accent-emerald"
          />
          <span className="text-xs font-bold text-emerald w-8">{minScore}%</span>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="rounded-xl border border-obsidian-border bg-charcoal shadow-obsidian-card overflow-hidden">
        <Table>
          <TableHeader className="bg-charcoal-light border-b border-obsidian-border">
            <TableRow className="border-obsidian-border hover:bg-transparent">
              <TableHead className="w-12 text-center text-xs text-sage-muted">Select</TableHead>
              <TableHead className="w-16 text-center text-xs text-sage-muted">Rank</TableHead>
              <TableHead className="text-xs text-sage-muted">Candidate Name</TableHead>
              <TableHead className="text-center text-xs text-sage-muted">Match Score</TableHead>
              <TableHead className="text-center text-xs text-sage-muted">Skills</TableHead>
              <TableHead className="text-center text-xs text-sage-muted">Experience</TableHead>
              <TableHead className="text-xs text-sage-muted">Recommendation</TableHead>
              <TableHead className="text-xs text-sage-muted">Status</TableHead>
              <TableHead className="text-right text-xs text-sage-muted">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-obsidian-border">
                <TableCell colSpan={9} className="text-center py-8 text-xs text-sage-muted">Loading candidate evaluations...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-obsidian-border">
                <TableCell colSpan={9} className="text-center py-8 text-xs text-sage-muted">No candidates match your criteria.</TableCell>
              </TableRow>
            ) : (
              filtered.map((c, i) => {
                const isRank1 = (c.rank === 1 || i === 0)
                return (
                  <TableRow
                    key={c.application_id || i}
                    className={`border-obsidian-border transition-colors ${
                      isRank1 ? 'bg-champagne/5 hover:bg-champagne/10' : 'hover:bg-charcoal-light/40'
                    }`}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(c.application_id)}
                        onChange={() => toggleSelect(c.application_id)}
                        className="rounded text-emerald focus:ring-emerald h-4 w-4 bg-charcoal border-obsidian-border accent-emerald"
                      />
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      {isRank1 ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-champagne bg-champagne/15 px-2 py-0.5 rounded-full border border-champagne/30">
                          <Award className="w-3 h-3 text-champagne" /> #1
                        </span>
                      ) : (
                        <span className="text-sage-muted">#{c.rank || i + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-warm-white text-sm">{c.candidate_name}</div>
                      <div className="text-xs text-sage-muted">{c.candidate_email}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center font-bold text-xs px-2.5 py-1 rounded-full border ${
                        isRank1
                          ? 'text-champagne bg-champagne/15 border-champagne/30'
                          : 'text-emerald bg-emerald-500/15 border-emerald-500/30'
                      }`}>
                        {Math.round(c.overall_score)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs text-sage">
                      {Math.round(c.skills_score)}%
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs text-sage">
                      {Math.round(c.experience_score)}%
                    </TableCell>
                    <TableCell>
                      <RecommendationBadge recommendation={c.ai_recommendation} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.recruiter_decision || c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald hover:bg-emerald-500/20"
                          onClick={() => handleDecision(c.application_id, 'shortlisted')}
                          title="Shortlist"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-coral hover:bg-coral/20"
                          onClick={() => handleDecision(c.application_id, 'rejected')}
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Link to={`/recruiter/candidates/${c.application_id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1 bg-charcoal-light border-obsidian-border text-warm-white hover:border-emerald hover:text-emerald">
                            <Eye className="w-3.5 h-3.5" /> Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
