import React, { useEffect, useState } from 'react'
import { getMyProfile } from '@/api/candidates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShieldCheck, Sparkles, Upload, TrendingUp, TrendingDown, AlertTriangle, BookOpen, Award, Briefcase, Code, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

const getSectionIcon = (section: string) => {
  switch (section.toLowerCase()) {
    case 'summary': return <BookOpen className="w-4 h-4" />
    case 'skills': return <Code className="w-4 h-4" />
    case 'experience': return <Briefcase className="w-4 h-4" />
    case 'projects': return <Sparkles className="w-4 h-4" />
    case 'education': return <GraduationCap className="w-4 h-4" />
    case 'certifications': return <Award className="w-4 h-4" />
    default: return <ShieldCheck className="w-4 h-4" />
  }
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase()
  if (['strong', 'verified', 'excellent'].includes(s)) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (['moderate', 'average'].includes(s)) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  return 'text-red-400 bg-red-500/10 border-red-500/20'
}

const formatBreakdownName = (key: string) => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export const ResumeQualityPage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyProfile().then(setProfileData).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  const hasResume = profileData?.has_resume === true
  const resume = profileData?.resume
  const qualityScoreFallback = profileData?.quality_score
  const analysis = profileData?.quality_analysis

  // EMPTY STATE BEFORE UPLOAD
  if (!hasResume || (!qualityScoreFallback && !analysis)) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Resume Quality Report
          </h1>
          <p className="text-xs text-sage-muted">Evaluation of structure, completeness, and keyword clarity</p>
        </div>

        <Card className="bg-charcoal border-obsidian-border shadow-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-light border border-obsidian-border flex items-center justify-center text-sage-muted mx-auto">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-warm-white text-lg">Resume Required</h3>
            <p className="text-xs text-sage-muted max-w-md mx-auto leading-relaxed">
              Please upload your resume first to access this feature. Upload a resume to view your Resume Quality Score.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/candidate/resume">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-extrabold text-xs px-8 h-11 shadow-lg shadow-emerald-500/10 gap-2">
                <Upload className="w-4 h-4" /> Upload Resume
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const overallScore = analysis?.overall_score ?? qualityScoreFallback ?? 0
  const breakdown = analysis?.breakdown || {}
  const sectionAnalysis = analysis?.section_analysis || {}
  const whatHelped = analysis?.what_helped || []
  const whatReduced = analysis?.what_reduced || []
  const suggestions = analysis?.suggestions || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Resume Quality Report
          </h1>
          <p className="text-xs text-sage-muted">Automated structural, completeness, and keyword analysis for {resume?.filename || 'your resume'}</p>
        </div>

        <Link to="/candidate/resume">
          <Button size="sm" variant="outline" className="border-emerald-500/20 text-sage hover:text-warm-white text-xs">
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Re-upload Resume
          </Button>
        </Link>
      </div>

      <Card className="bg-charcoal border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between p-6 gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Overall Quality Score
          </span>
          <h2 className="text-3xl font-extrabold text-warm-white font-mono">
            {overallScore.toFixed(1)}%
          </h2>
          <p className="text-xs text-sage-muted max-w-md leading-relaxed">
            Derived from contact verification, structured sections, work experience depth, metric quantifiers, and skill taxonomy breadth.
          </p>
        </div>
        <ScoreCircle score={overallScore} size={110} strokeWidth={8} />
      </Card>

      {/* Breakdown Scores */}
      {Object.keys(breakdown).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(breakdown).map(([key, score]) => (
            <Card key={key} className="bg-charcoal border-obsidian-border p-3 flex flex-col items-center text-center space-y-1">
              <span className="text-[10px] font-bold text-sage-muted uppercase tracking-wider">{formatBreakdownName(key)}</span>
              <span className="text-lg font-mono font-bold text-warm-white">{Number(score).toFixed(1)}%</span>
            </Card>
          ))}
        </div>
      )}

      {/* Section Analysis Grid */}
      {Object.keys(sectionAnalysis).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-warm-white">Section Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(sectionAnalysis).map(([section, data]: [string, any]) => (
              <Card key={section} className="bg-charcoal-light/60 border-obsidian-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-warm-white flex items-center gap-2 capitalize">
                    <span className="text-emerald-400">{getSectionIcon(section)}</span>
                    {section}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-sage-muted">Score</span>
                    <span className="font-mono text-warm-white">{Number(data.score).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-obsidian rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(0, data.score))}%` }} 
                    />
                  </div>
                </div>
                {data.count !== undefined && (
                  <p className="text-[11px] text-sage-muted">Items detected: <span className="text-warm-white font-medium">{data.count}</span></p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What Helped */}
        {whatHelped.length > 0 && (
          <Card className="bg-charcoal-light/60 border-emerald-500/20 p-5 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              What Strengthened Your Score
            </h3>
            <div className="space-y-3">
              {whatHelped.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-sage leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* What Reduced */}
        {whatReduced.length > 0 && (
          <Card className="bg-charcoal-light/60 border-amber-500/20 p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              What Reduced Your Score
            </h3>
            <div className="space-y-3">
              {whatReduced.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-sage leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-charcoal border-obsidian-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-warm-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-champagne" />
            Need to Improve
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((sug: any, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-charcoal-light/60 border border-obsidian-border space-y-3">
                <div className="inline-block text-[10px] font-bold text-champagne bg-champagne/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {sug.section}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sage-muted uppercase tracking-wider">Issue</span>
                    <p className="text-xs text-warm-white">{sug.what}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sage-muted uppercase tracking-wider">Impact</span>
                    <p className="text-xs text-sage">{sug.why}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sage-muted uppercase tracking-wider">Action</span>
                    <p className="text-xs text-emerald-400 font-medium">{sug.how}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
