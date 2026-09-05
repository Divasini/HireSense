import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJob, getJobCandidates, updateScoreWeights, getScoreWeights } from '@/api/jobs'
import { Job, RankedCandidate, ScoreWeights } from '@/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { RecommendationBadge } from '@/components/common/RecommendationBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ExportButton } from '@/components/common/ExportButton'
import { Upload, Users, Sliders, ArrowLeft, Eye, Check, X, Sparkles, Crown, Building2, MapPin } from 'lucide-react'
import { shortlistCandidate, batchShortlist } from '@/api/screening'
import toast from 'react-hot-toast'

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [candidates, setCandidates] = useState<RankedCandidate[]>([])
  const [weights, setWeights] = useState<ScoreWeights>({
    skills_weight: 0.4,
    experience_weight: 0.25,
    education_weight: 0.15,
    project_weight: 0.1,
    certification_weight: 0.1
  })
  const [threshold, setThreshold] = useState(75)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        setLoading(true)
        const [jData, cData, wData] = await Promise.all([
          getJob(id),
          getJobCandidates(id),
          getScoreWeights(id)
        ])
        setJob(jData)
        setCandidates(cData || [])
        if (wData) setWeights(wData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSaveWeights = async () => {
    if (!id) return
    try {
      await updateScoreWeights(id, weights)
      toast.success('Scoring weights updated & recalculated')
      const updated = await getJobCandidates(id)
      setCandidates(updated || [])
    } catch {
      toast.error('Failed to update weights')
    }
  }

  const handleDecision = async (appId: string, decision: string) => {
    try {
      await shortlistCandidate(appId, decision)
      toast.success(`Candidate marked as ${decision}`)
      if (id) {
        const updated = await getJobCandidates(id)
        setCandidates(updated || [])
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const handleBatchShortlist = async () => {
    if (!id) return
    try {
      await batchShortlist(id, threshold)
      toast.success(`Candidates with score >= ${threshold}% shortlisted`)
      const updated = await getJobCandidates(id)
      setCandidates(updated || [])
    } catch {
      toast.error('Batch shortlisting failed')
    }
  }

  if (!job) return <div className="p-8 text-center text-sage-muted">Loading position details...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal border border-emerald-500/10 rounded-2xl p-6">
        <div className="space-y-1.5">
          <Link to="/recruiter/jobs" className="text-xs text-sage hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-warm-white">{job.title}</h1>
          <p className="text-xs text-sage-muted flex items-center gap-3">
            <span className="flex items-center gap-1 text-sage"><Building2 className="w-3.5 h-3.5" /> {job.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {job.location}</span>
            <span>•</span>
            <span>{job.experience_required}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportButton jobId={job.id} />
          <Link to={`/recruiter/upload`}>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-1.5 text-xs shadow-md shadow-emerald-500/10">
              <Upload className="w-3.5 h-3.5" />
              Upload Resumes
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList className="bg-charcoal border border-emerald-500/10 p-1">
          <TabsTrigger value="candidates" className="gap-1.5 text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">
            <Users className="w-3.5 h-3.5" />
            Ranked Candidates ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">
            Position Overview
          </TabsTrigger>
          <TabsTrigger value="weights" className="gap-1.5 text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">
            <Sliders className="w-3.5 h-3.5" />
            Scoring Weights
          </TabsTrigger>
        </TabsList>

        {/* Candidates Table */}
        <TabsContent value="candidates" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-charcoal p-3.5 rounded-xl border border-emerald-500/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-warm-white">Auto-Shortlist Threshold:</span>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-16 h-8 text-xs font-bold text-center border border-emerald-500/20 bg-charcoal-light text-warm-white rounded-md focus:border-emerald-500 outline-none"
                min="0"
                max="100"
              />
              <span className="text-xs text-sage-muted">%</span>
              <Button size="sm" variant="secondary" onClick={handleBatchShortlist} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs h-8">
                Apply Shortlist
              </Button>
            </div>
            <Link to="/recruiter/compare">
              <Button size="sm" variant="outline" className="border-emerald-500/20 text-sage hover:text-warm-white hover:bg-charcoal text-xs h-8">
                Compare Selected Candidates
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-emerald-500/10 bg-charcoal shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-charcoal-light/80">
                <TableRow className="border-b border-emerald-500/10">
                  <TableHead className="w-16 text-center text-xs text-sage-muted">Rank</TableHead>
                  <TableHead className="text-xs text-sage-muted">Candidate</TableHead>
                  <TableHead className="text-center text-xs text-sage-muted">Match Score</TableHead>
                  <TableHead className="text-xs text-sage-muted">Key Matches</TableHead>
                  <TableHead className="text-xs text-sage-muted">Recommendation</TableHead>
                  <TableHead className="text-xs text-sage-muted">Status</TableHead>
                  <TableHead className="text-right text-xs text-sage-muted">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c, i) => {
                  const isTopRank = (c.rank || i + 1) === 1
                  return (
                    <TableRow key={c.application_id || i} className={`hover:bg-emerald-500/[0.03] border-b border-emerald-500/10 transition-colors ${isTopRank ? 'bg-champagne/5' : ''}`}>
                      <TableCell className="text-center font-bold text-xs">
                        {isTopRank ? (
                          <div className="inline-flex items-center gap-1 font-bold text-champagne bg-champagne/10 border border-champagne/30 px-2 py-0.5 rounded-full text-xs shadow-sm">
                            <Crown className="w-3 h-3 text-champagne" />
                            #1
                          </div>
                        ) : (
                          <span className="text-sage font-mono">#{c.rank || i + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-warm-white text-sm">{c.candidate_name}</div>
                        <div className="text-xs text-sage-muted font-mono">{c.candidate_email}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex items-center justify-center font-bold text-sm px-2.5 py-1 rounded-full border ${
                          isTopRank
                            ? 'text-champagne bg-champagne/10 border-champagne/30'
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          {Math.round(c.overall_score)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(c.matched_skills || []).slice(0, 3).map((s, idx) => (
                            <span key={idx} className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
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
                            className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/20"
                            onClick={() => handleDecision(c.application_id, 'shortlisted')}
                            title="Shortlist"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-coral-400 hover:bg-coral-500/20"
                            onClick={() => handleDecision(c.application_id, 'rejected')}
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Link to={`/recruiter/candidates/${c.application_id}`}>
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                              <Eye className="w-3 h-3" /> View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card className="bg-charcoal border-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-base font-bold text-warm-white">Job Description & Extracted Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-warm-white mb-1.5">Description</h4>
                <p className="text-sage-muted leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-charcoal-light border border-emerald-500/20">
                  <h4 className="font-semibold text-emerald-400 mb-2.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Mandatory Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.required_skills || []).map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-light border border-champagne/20">
                  <h4 className="font-semibold text-champagne mb-2.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Preferred Advantage Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.preferred_skills || []).map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-champagne/10 text-champagne border border-champagne/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weights Tab */}
        <TabsContent value="weights">
          <Card className="bg-charcoal border-emerald-500/10 max-w-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-warm-white">Explainable AI Scoring Weights</CardTitle>
              <CardDescription className="text-xs text-sage-muted">Customize component weights (must sum to 100%)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-warm-white">
                  <span>Skills Match Weight</span>
                  <span className="text-emerald-400 font-mono">{Math.round(weights.skills_weight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.skills_weight * 100}
                  onChange={e => setWeights({ ...weights, skills_weight: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-warm-white">
                  <span>Experience Relevance Weight</span>
                  <span className="text-emerald-400 font-mono">{Math.round(weights.experience_weight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.experience_weight * 100}
                  onChange={e => setWeights({ ...weights, experience_weight: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-warm-white">
                  <span>Education Match Weight</span>
                  <span className="text-emerald-400 font-mono">{Math.round(weights.education_weight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.education_weight * 100}
                  onChange={e => setWeights({ ...weights, education_weight: Number(e.target.value) / 100 })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <Button onClick={handleSaveWeights} className="w-full bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold mt-4 shadow-lg shadow-emerald-500/10">
                Save & Recalculate Scores
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
