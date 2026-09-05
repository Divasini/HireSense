import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getScreeningResult, getInterviewQuestions, generateInterviewQuestions, shortlistCandidate } from '@/api/screening'
import { exportScreeningPDF } from '@/api/exports'
import { ScreeningResult, InterviewQuestion } from '@/types'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { ScoreBreakdown } from '@/components/common/ScoreBreakdown'
import { SkillGapChart } from '@/components/common/SkillGapChart'
import { RecommendationBadge } from '@/components/common/RecommendationBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Sparkles,
  Bot,
  HelpCircle,
  Check,
  X,
  FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await getScreeningResult(id)
        setResult(res)
        const qData = await getInterviewQuestions(id)
        setQuestions(qData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleGenQuestions = async () => {
    if (!id) return
    try {
      setGeneratingQuestions(true)
      const q = await generateInterviewQuestions(id)
      setQuestions(q || [])
      toast.success('Generated tailored interview questions!')
    } catch {
      toast.error('Failed to generate questions')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!id) return
    try {
      const blob = await exportScreeningPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hiresense_report_${id}.pdf`
      a.click()
      toast.success('Downloaded screening report PDF')
    } catch {
      toast.error('Failed to generate PDF')
    }
  }

  const handleShortlist = async (decision: string) => {
    if (!id) return
    try {
      await shortlistCandidate(id, decision)
      toast.success(`Candidate marked as ${decision}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) return <div className="p-8 text-center text-sage-muted text-xs">Loading candidate profile...</div>
  if (!result) return <div className="p-8 text-center text-sage-muted text-xs">Candidate evaluation not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-6 rounded-2xl border border-obsidian-border shadow-obsidian-card">
        <div className="space-y-1">
          <Link to="/recruiter/ranking" className="text-xs text-sage-muted hover:text-emerald flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Rankings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-warm-white">Candidate Evaluation Profile</h1>
            <RecommendationBadge recommendation={result.interview_recommendation} />
          </div>
          <p className="text-xs text-sage-muted">Application Ref: {result.application_id}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs bg-charcoal gap-1.5">
            <FileDown className="w-3.5 h-3.5 text-emerald-400" /> PDF Report
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleShortlist('rejected')} className="text-coral border-coral/30 hover:bg-coral/10 text-xs bg-charcoal">
            <X className="w-3.5 h-3.5 mr-1" /> Reject
          </Button>
          <Button size="sm" onClick={() => handleShortlist('shortlisted')} className="bg-emerald hover:bg-emerald-600 text-obsidian font-bold text-xs">
            <Check className="w-3.5 h-3.5 mr-1 text-obsidian" /> Shortlist Candidate
          </Button>
        </div>
      </div>

      {/* Score & Explainable AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card flex flex-col items-center justify-center p-6 text-center">
          <ScoreCircle score={result.overall_score} size={140} strokeWidth={10} />
          <h3 className="font-bold text-warm-white text-base mt-4">Overall Match Score</h3>
          <p className="text-xs text-sage-muted mt-1">Multi-factor qualification vector</p>
        </Card>

        {/* ✦ HireSense Intelligence Insight Panel */}
        <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-warm-white flex items-center gap-2">
              <span className="text-emerald">✦</span>
              <span>HireSense Intelligence</span>
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Transparent Explainable AI (XAI) Justification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-charcoal-light border border-emerald-500/20 text-xs text-sage leading-relaxed">
              {result.ai_summary || result.explanation || 'Strong qualification alignment across primary technical benchmarks.'}
            </div>

            <div className="pt-1">
              <ScoreBreakdown
                scores={{
                  skills: result.skills_score,
                  experience: result.experience_score,
                  education: result.education_score,
                  projects: result.project_score,
                  certifications: result.certification_score,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="bg-charcoal border border-obsidian-border p-1">
          <TabsTrigger value="skills" className="text-xs data-[state=active]:bg-emerald data-[state=active]:text-obsidian font-semibold">Skills & Gap Analysis</TabsTrigger>
          <TabsTrigger value="experience" className="text-xs data-[state=active]:bg-emerald data-[state=active]:text-obsidian font-semibold">Experience Analysis</TabsTrigger>
          <TabsTrigger value="questions" className="text-xs data-[state=active]:bg-emerald data-[state=active]:text-obsidian font-semibold gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Interview Questions ({questions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-warm-white">Skill Gap Analysis</CardTitle>
              <CardDescription className="text-xs text-sage-muted">Required competencies compared against extracted resume entities</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillGapChart matched={result.matched_skills || []} missing={result.missing_skills || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card className="bg-charcoal border-obsidian-border shadow-obsidian-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-warm-white">Experience Relevance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-charcoal-light border border-obsidian-border">
                  <span className="text-sage-muted font-medium">Relevance Score</span>
                  <div className="text-xl font-bold text-warm-white mt-1">{result.experience_score}%</div>
                </div>
                <div className="p-4 rounded-xl bg-charcoal-light border border-obsidian-border">
                  <span className="text-sage-muted font-medium">Semantic Similarity</span>
                  <div className="text-xl font-bold text-emerald mt-1">{Math.round((result.semantic_similarity_score || 0.8) * 100)}%</div>
                </div>
                <div className="p-4 rounded-xl bg-charcoal-light border border-obsidian-border">
                  <span className="text-sage-muted font-medium">Project Relevance</span>
                  <div className="text-xl font-bold text-champagne mt-1">{result.project_score}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center bg-charcoal p-4 rounded-xl border border-obsidian-border">
            <div>
              <h3 className="font-bold text-warm-white text-sm">Personalized Interview Questionnaire</h3>
              <p className="text-xs text-sage-muted">Formulated dynamically from candidate projects and identified skill gaps</p>
            </div>
            <Button
              size="sm"
              onClick={handleGenQuestions}
              disabled={generatingQuestions}
              className="bg-emerald hover:bg-emerald-600 text-obsidian font-bold gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-obsidian" />
              {generatingQuestions ? 'Regenerating...' : 'Regenerate Questions'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, idx) => (
              <Card key={idx} className="bg-charcoal border-obsidian-border shadow-obsidian-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald border border-emerald-500/20">
                      {q.category}
                    </span>
                    <span className="text-[10px] capitalize text-sage-muted font-medium">
                      Difficulty: {q.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="text-xs font-medium text-warm-white leading-relaxed">
                  {q.question}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
