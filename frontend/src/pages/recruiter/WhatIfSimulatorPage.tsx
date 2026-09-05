import React, { useEffect, useState } from 'react'
import { getJobs } from '@/api/jobs'
import { getCandidates } from '@/api/candidates'
import { whatIfSimulation } from '@/api/screening'
import { Job, Candidate, WhatIfResult } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { SlidersHorizontal, Sparkles, Plus, X, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

export const WhatIfSimulatorPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [selectedCand, setSelectedCand] = useState<string>('')
  
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [expReq, setExpReq] = useState('3+ years')
  
  const [simulationResult, setSimulationResult] = useState<WhatIfResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getJobs(), getCandidates({ per_page: 50 })]).then(([jData, cData]) => {
      setJobs(jData || [])
      setCandidates(cData?.candidates || [])
      if (jData && jData.length > 0) {
        setSelectedJob(jData[0].id)
        setSkills(jData[0].required_skills || ['Python', 'SQL'])
        setExpReq(jData[0].experience_required || '3+ years')
      }
      if (cData?.candidates && cData.candidates.length > 0) {
        setSelectedCand(cData.candidates[0].id)
      }
    })
  }, [])

  const handleJobChange = (jobId: string) => {
    setSelectedJob(jobId)
    const j = jobs.find(x => x.id === jobId)
    if (j) {
      setSkills(j.required_skills || [])
      setExpReq(j.experience_required || '3+ years')
    }
  }

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter(x => x !== s))
  }

  const handleSimulate = async () => {
    if (!selectedJob || !selectedCand) {
      toast.error('Please select both a position and a candidate')
      return
    }

    try {
      setLoading(true)
      const res = await whatIfSimulation({
        job_id: selectedJob,
        candidate_id: selectedCand,
        modified_required_skills: skills,
        modified_experience: expReq
      })
      setSimulationResult(res)
      toast.success('Simulation recalculated successfully!')
    } catch {
      toast.error('Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-champagne" />
          What-If Score Simulator
        </h1>
        <p className="text-xs text-sage-muted">
          Modify position criteria dynamically to see how candidate scores and eligibility recalculate with Explainable AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-warm-white">Adjust Position Criteria Parameters</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Tweak mandatory skills and experience thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Target Position</Label>
                <select
                  value={selectedJob}
                  onChange={e => handleJobChange(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-semibold rounded-md border border-obsidian-border bg-charcoal-light text-warm-white outline-none focus:border-emerald"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id} className="bg-charcoal text-warm-white">{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Target Candidate</Label>
                <select
                  value={selectedCand}
                  onChange={e => setSelectedCand(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-semibold rounded-md border border-obsidian-border bg-charcoal-light text-warm-white outline-none focus:border-emerald"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id} className="bg-charcoal text-warm-white">{c.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-sage-muted">Simulate Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Add a required skill (e.g. Docker, PyTorch)"
                  className="h-9 text-xs bg-charcoal-light border-obsidian-border text-warm-white focus:border-emerald"
                />
                <Button size="sm" onClick={handleAddSkill} variant="outline" className="text-xs bg-charcoal border-obsidian-border text-warm-white hover:border-emerald hover:text-emerald">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    {s}
                    <button onClick={() => handleRemoveSkill(s)} className="text-emerald hover:text-warm-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-semibold text-sage-muted">Simulate Experience Requirement</Label>
              <Input
                value={expReq}
                onChange={e => setExpReq(e.target.value)}
                placeholder="e.g. 2+ years, 5+ years"
                className="h-9 text-xs max-w-xs bg-charcoal-light border-obsidian-border text-warm-white focus:border-emerald"
              />
            </div>

            <Button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-emerald hover:bg-emerald-600 text-obsidian font-bold gap-2 mt-4 text-xs h-10"
            >
              <Sparkles className="w-4 h-4 text-obsidian" />
              {loading ? 'Recalculating Mathematical Vectors...' : 'Recalculate Match Score Live'}
            </Button>
          </CardContent>
        </Card>

        {/* Live Simulation Output */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-warm-white">Simulation Results</CardTitle>
            <CardDescription className="text-xs text-sage-muted">Real-time delta vs baseline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex justify-center items-center gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-sage-muted block mb-1">Baseline</span>
                    <ScoreCircle score={simulationResult.original_score} size={64} strokeWidth={6} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-sage-muted mt-4" />
                  <div>
                    <span className="text-[10px] font-semibold text-emerald block mb-1">Simulated</span>
                    <ScoreCircle score={simulationResult.new_score} size={74} strokeWidth={7} />
                  </div>
                </div>

                <div className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold ${
                  simulationResult.score_change >= 0
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-coral/15 text-coral-light border border-coral/30'
                }`}>
                  {simulationResult.score_change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-coral" />
                  )}
                  Delta: {simulationResult.score_change >= 0 ? `+${simulationResult.score_change}%` : `${simulationResult.score_change}%`}
                </div>

                <p className="text-xs text-sage text-left bg-charcoal-light p-3.5 rounded-xl border border-obsidian-border leading-relaxed">
                  {simulationResult.explanation}
                </p>
              </div>
            ) : (
              <div className="py-12 text-sage-muted text-xs">
                Click "Recalculate Match Score Live" to run the simulation engine.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
