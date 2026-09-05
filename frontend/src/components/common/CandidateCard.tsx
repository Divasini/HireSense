import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { RecommendationBadge } from '@/components/common/RecommendationBadge'
import { Button } from '@/components/ui/button'
import { Eye, MapPin, Briefcase, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CandidateCardProps {
  candidate: {
    id: string
    full_name: string
    email: string
    location?: string
    total_experience_years?: number
    skills?: string[]
    overall_score?: number
    recommendation?: string
    application_id?: string
    isTopRank?: boolean
  }
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  return (
    <Card className={`bg-charcoal border-obsidian-border hover:border-emerald-500/40 transition-all shadow-obsidian-card ${candidate.isTopRank ? 'border-champagne/40 bg-charcoal/90' : ''}`}>
      <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ScoreCircle score={candidate.overall_score ?? 75} size={64} strokeWidth={6} isTopRank={candidate.isTopRank} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-warm-white text-base">{candidate.full_name}</h3>
              {candidate.isTopRank && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-champagne bg-champagne/10 px-2 py-0.5 rounded-full border border-champagne/30">
                  <Award className="w-3 h-3" /> Top Candidate
                </span>
              )}
            </div>
            <p className="text-xs text-sage-muted">{candidate.email}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-sage-muted">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sage" />
                  {candidate.location}
                </span>
              )}
              {candidate.total_experience_years !== undefined && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-sage" />
                  {candidate.total_experience_years} yrs exp
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
          <RecommendationBadge recommendation={candidate.recommendation || 'recommended'} />
          <Link to={`/recruiter/candidates/${candidate.application_id || candidate.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs bg-charcoal-light border-obsidian-border text-warm-white hover:bg-emerald-500/10 hover:text-emerald hover:border-emerald-500/30">
              <Eye className="w-3.5 h-3.5" />
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
