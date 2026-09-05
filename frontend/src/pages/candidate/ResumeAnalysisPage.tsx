import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getMyProfile } from '@/api/candidates'
import {
  Layers,
  Code2,
  Database,
  Cloud,
  Cpu,
  CheckCircle2,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const ResumeAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [hasResume, setHasResume] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getMyProfile()
      setProfile(data.candidate)
      setHasResume(data.has_resume)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load resume analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  const parsed = profile?.parsed_data || {}
  const skillsList = profile?.skills || parsed.skills || []

  // Group skills by category
  const categories: Record<string, string[]> = {
    programming: [],
    framework: [],
    database: [],
    cloud: [],
    data_science: [],
    soft_skill: [],
    other: []
  }

  skillsList.forEach((s: any) => {
    const name = typeof s === 'string' ? s : s.name
    const cat = (typeof s === 'object' && s.category) ? s.category.toLowerCase() : 'other'
    if (categories[cat]) {
      categories[cat].push(name)
    } else {
      categories.other.push(name)
    }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            Resume Semantic Analysis
          </h1>
          <p className="text-xs text-sage-muted">Deep entity parsing, skill taxonomies, and career trajectory breakdown</p>
        </div>
        <Link to="/candidate/resume">
          <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Manage Resume Versions
          </Button>
        </Link>
      </div>

      {!hasResume && (
        <Card className="bg-charcoal border-amber-500/30 p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-warm-white">No active resume uploaded yet</p>
          <p className="text-xs text-sage-muted">Upload your PDF or DOCX resume to view comprehensive NLP semantic breakdown.</p>
          <Link to="/candidate/resume">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs">
              Upload Resume
            </Button>
          </Link>
        </Card>
      )}

      {hasResume && (
        <>
          {/* Skill Categorization Grid */}
          <div>
            <h2 className="text-sm font-bold text-warm-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Categorized Skill Taxonomy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Programming */}
              <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-warm-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-400" /> Programming Languages
                    </span>
                    <span className="text-[10px] text-sage-muted font-mono">{categories.programming.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap gap-1.5">
                  {categories.programming.length > 0 ? (
                    categories.programming.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-muted italic">None detected</span>
                  )}
                </CardContent>
              </Card>

              {/* Frameworks */}
              <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-warm-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-champagne" /> Frameworks & Libraries
                    </span>
                    <span className="text-[10px] text-sage-muted font-mono">{categories.framework.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap gap-1.5">
                  {categories.framework.length > 0 ? (
                    categories.framework.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-champagne/10 text-champagne border border-champagne/20 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-muted italic">None detected</span>
                  )}
                </CardContent>
              </Card>

              {/* Databases */}
              <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-warm-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-sage" /> Databases & Storage
                    </span>
                    <span className="text-[10px] text-sage-muted font-mono">{categories.database.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap gap-1.5">
                  {categories.database.length > 0 ? (
                    categories.database.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-sage/10 text-sage border border-sage/20 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-muted italic">None detected</span>
                  )}
                </CardContent>
              </Card>

              {/* Cloud & DevOps */}
              <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-warm-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-400" /> Cloud & Infrastructure
                    </span>
                    <span className="text-[10px] text-sage-muted font-mono">{categories.cloud.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap gap-1.5">
                  {categories.cloud.length > 0 ? (
                    categories.cloud.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-muted italic">None detected</span>
                  )}
                </CardContent>
              </Card>

              {/* Data Science & ML */}
              <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-warm-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> AI & Data Science
                    </span>
                    <span className="text-[10px] text-sage-muted font-mono">{categories.data_science.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap gap-1.5">
                  {categories.data_science.length > 0 ? (
                    categories.data_science.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-muted italic">None detected</span>
                  )}
                </CardContent>
              </Card>

              {/* Tools & Other */}
              <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-warm-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sage-muted" /> Tools & Other Competencies
                    </span>
                    <span className="text-[10px] text-sage-muted font-mono">{categories.other.length + categories.soft_skill.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap gap-1.5">
                  {[...categories.other, ...categories.soft_skill].length > 0 ? (
                    [...categories.other, ...categories.soft_skill].map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-charcoal-light text-sage border border-obsidian-border font-mono">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-sage-muted italic">None detected</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Experience Timeline */}
          {parsed.experience && parsed.experience.length > 0 && (
            <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold text-warm-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Extracted Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {parsed.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-charcoal-light/60 border border-obsidian-border space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-warm-white">{exp.job_title || exp.title || 'Role'}</span>
                      <span className="text-[11px] text-emerald-400 font-mono">{exp.duration || (exp.start_date ? `${exp.start_date} - ${exp.end_date || 'Present'}` : '')}</span>
                    </div>
                    <p className="text-xs text-sage font-medium">{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-sage-muted leading-relaxed">{exp.description}</p>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.technologies.map((t: string, tidx: number) => (
                          <span key={tidx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal text-sage-muted border border-obsidian-border">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education Breakdown */}
          {parsed.education && parsed.education.length > 0 && (
            <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold text-warm-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-champagne" /> Extracted Academic Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {parsed.education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-charcoal-light/60 border border-obsidian-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-warm-white">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</p>
                      <p className="text-xs text-sage-muted">{edu.institution}</p>
                    </div>
                    {edu.graduation_year && (
                      <span className="text-xs text-champagne font-mono font-semibold">{edu.graduation_year}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
