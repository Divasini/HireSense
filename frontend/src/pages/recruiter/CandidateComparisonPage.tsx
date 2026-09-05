import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { compareCandidates } from '@/api/screening'
import { ComparisonCandidate } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { RecommendationBadge } from '@/components/common/RecommendationBadge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Award, CheckCircle2 } from 'lucide-react'

export const CandidateComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [candidates, setCandidates] = useState<ComparisonCandidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const idsParam = searchParams.get('ids')
    if (!idsParam) {
      setLoading(false)
      return
    }
    const ids = idsParam.split(',')
    compareCandidates(ids).then(data => {
      setCandidates(data || [])
      setLoading(false)
    })
  }, [searchParams])

  if (loading) return <div className="p-8 text-center text-sage-muted text-xs">Loading candidate comparisons...</div>
  if (candidates.length === 0) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sage-muted text-xs">Select 2 or more candidates from the Rankings table to compare side-by-side.</p>
        <Link to="/recruiter/ranking">
          <Button size="sm" className="bg-emerald text-obsidian font-bold text-xs">Go to Candidate Rankings</Button>
        </Link>
      </div>
    )
  }

  const highestScore = Math.max(...candidates.map(c => c.screening_result.overall_score))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/recruiter/ranking" className="text-xs text-sage-muted hover:text-emerald flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Rankings
          </Link>
          <h1 className="text-2xl font-bold text-warm-white">Side-by-Side Candidate Comparison</h1>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-${candidates.length} gap-6`}>
        {candidates.map((item, idx) => {
          const isWinner = item.screening_result.overall_score === highestScore
          return (
            <Card
              key={idx}
              className={`bg-charcoal border transition-all shadow-obsidian-card ${
                isWinner ? 'border-champagne/50 bg-charcoal/90' : 'border-obsidian-border'
              }`}
            >
              <CardHeader className="text-center pb-2">
                {isWinner && (
                  <div className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-champagne bg-champagne/15 px-2.5 py-0.5 rounded-full w-fit mx-auto mb-2 border border-champagne/30">
                    <Award className="w-3.5 h-3.5 text-champagne" /> Top Choice
                  </div>
                )}
                <CardTitle className="text-base font-bold text-warm-white">{item.candidate?.full_name || 'Candidate'}</CardTitle>
                <p className="text-xs text-sage-muted">{item.candidate?.email}</p>
                <div className="py-4">
                  <ScoreCircle score={item.screening_result.overall_score} size={88} strokeWidth={8} isTopRank={isWinner} />
                </div>
                <RecommendationBadge recommendation={item.screening_result.interview_recommendation} />
              </CardHeader>

              <CardContent className="space-y-4 pt-4 border-t border-obsidian-border text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-sage-muted">
                    <span>Skills Score</span>
                    <span className="text-emerald">{Math.round(item.screening_result.skills_score)}%</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sage-muted">
                    <span>Experience Score</span>
                    <span className="text-sage">{Math.round(item.screening_result.experience_score)}%</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sage-muted">
                    <span>Education Score</span>
                    <span className="text-champagne">{Math.round(item.screening_result.education_score)}%</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sage-muted">
                    <span>Project Relevance</span>
                    <span className="text-emerald-400">{Math.round(item.screening_result.project_score)}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-obsidian-border space-y-1.5">
                  <span className="font-bold text-warm-white">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {(item.screening_result.matched_skills || []).map((s, i) => (
                      <span key={i} className="bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/25">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <Link to={`/recruiter/candidates/${item.application_id}`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs bg-charcoal-light border-obsidian-border text-warm-white hover:border-emerald hover:text-emerald">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
