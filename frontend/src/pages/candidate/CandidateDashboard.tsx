import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getMyDashboard, uploadMyResume, getMyApplications } from '@/api/candidates'
import { ScoreCircle } from '@/components/common/ScoreCircle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Upload,
  Building2,
  MapPin,
  Clock,
  Layers,
  Mic,
  FileSearch,
  FileText,
  AlertCircle,
  FileCheck2,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // In-dashboard resume upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [dData, aData] = await Promise.all([
        getMyDashboard(),
        getMyApplications()
      ])
      setDashboardData(dData)
      setApplications(aData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const validateAndStageFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      toast.error('Invalid file format. Please upload a PDF, DOCX, or TXT file.')
      return
    }
    if (file.size === 0) {
      toast.error('The selected file is empty.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.')
      return
    }
    setSelectedFile(file)
  }

  const handleUploadResume = async () => {
    if (!selectedFile) return
    try {
      setUploading(true)
      const steps = [
        'Uploading Resume Document...',
        'Extracting Resume Text...',
        'Analyzing Candidate Profile...',
        'Detecting Skills & Competencies...',
        'Evaluating Resume Quality...',
        'Checking ATS Compatibility...',
        'Generating Job Matches...',
        'Analysis Complete!'
      ]
      for (let i = 0; i < steps.length - 1; i++) {
        setProcessingStep(steps[i])
        await new Promise(r => setTimeout(r, 450))
      }
      await uploadMyResume(selectedFile)
      setProcessingStep('Analysis Complete!')
      await new Promise(r => setTimeout(r, 400))
      toast.success('Resume uploaded and analyzed successfully!')
      setSelectedFile(null)
      await fetchAll()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to upload and analyze resume'
      toast.error(msg)
    } finally {
      setUploading(false)
      setProcessingStep('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  const hasResume = dashboardData?.has_resume === true
  const candidateName = dashboardData?.user_name || user?.full_name || 'Candidate'
  const qualityScore = dashboardData?.quality_score
  const atsScore = dashboardData?.ats_score
  const skillsCount = dashboardData?.skills_count || 0
  const recommendedJobs = dashboardData?.recommended_jobs || []

  // =========================================================================
  // STEP 1 — BEFORE RESUME UPLOAD (CLEAN EMPTY STATE)
  // =========================================================================
  if (!hasResume) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner with clear indication */}
        <div className="bg-charcoal border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-warm-white shadow-xl shadow-black/50 space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Resume not uploaded
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-warm-white">
              Your career analysis starts here
            </h1>
            <p className="text-xs sm:text-sm text-sage-muted leading-relaxed max-w-2xl">
              Upload your resume to unlock AI-powered resume analysis, ATS scoring, job matching, and interview preparation.
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-extrabold text-xs px-6 h-10 shadow-lg shadow-emerald-500/15 gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Resume
            </Button>
          </div>
        </div>

        {/* Drag & Drop Upload Card */}
        <Card className="bg-charcoal border-emerald-500/20 shadow-xl overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" /> Upload Resume
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">
              Supported formats: PDF, DOCX, TXT (Maximum file size: 10MB)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-2 space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault()
                setIsDragging(false)
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  validateAndStageFile(e.dataTransfer.files[0])
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-emerald-500/30 hover:border-emerald-400/60 bg-charcoal-light/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    validateAndStageFile(e.target.files[0])
                  }
                }}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-warm-white">
                  Drag & Drop Resume or <span className="text-emerald-400 underline">Browse Files</span>
                </p>
                <p className="text-xs text-sage-muted">
                  Upload your actual resume to begin automated AI processing
                </p>
              </div>
            </div>

            {/* Staged File Preview */}
            {selectedFile && !uploading && (
              <div className="p-4 rounded-xl bg-charcoal-light border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-white">{selectedFile.name}</p>
                    <p className="text-[11px] text-sage-muted font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-sage-muted hover:text-coral h-9 px-3"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUploadResume}
                    className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-6 shadow-md shadow-emerald-500/15"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Uploading Progress */}
            {uploading && (
              <div className="p-5 rounded-xl bg-charcoal-light border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                    {processingStep}
                  </span>
                  <span className="text-sage-muted font-mono">Processing...</span>
                </div>
                <div className="w-full bg-obsidian rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-400 h-2 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Empty-State Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-charcoal/60 border border-obsidian-border text-sage-muted space-y-1">
            <span className="font-bold text-warm-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resume Quality
            </span>
            <p className="text-[11px] leading-relaxed text-sage-muted">Upload your resume to generate your quality score.</p>
          </div>
          <div className="p-4 rounded-xl bg-charcoal/60 border border-obsidian-border text-sage-muted space-y-1">
            <span className="font-bold text-warm-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ATS Compatibility
            </span>
            <p className="text-[11px] leading-relaxed text-sage-muted">Upload your resume to generate your ATS score.</p>
          </div>
          <div className="p-4 rounded-xl bg-charcoal/60 border border-obsidian-border text-sage-muted space-y-1">
            <span className="font-bold text-warm-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Job Matches
            </span>
            <p className="text-[11px] leading-relaxed text-sage-muted">Upload your resume to discover suitable opportunities.</p>
          </div>
          <div className="p-4 rounded-xl bg-charcoal/60 border border-obsidian-border text-sage-muted space-y-1">
            <span className="font-bold text-warm-white flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" /> AI Interview Prep
            </span>
            <p className="text-[11px] leading-relaxed text-sage-muted">Upload your resume to unlock personalized interview preparation.</p>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // STEP 2 & 10 — AFTER RESUME UPLOAD (UNLOCKED DASHBOARD)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal border border-emerald-500/20 rounded-2xl p-6 text-warm-white shadow-xl shadow-black/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Resume Active & Verified
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, <span className="text-emerald-400">{candidateName}</span>
          </h1>
          <p className="text-xs text-sage-muted">
            Track your ATS compatibility, calculated quality score, and matched job openings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/candidate/profile">
            <Button size="sm" variant="outline" className="border-emerald-500/20 text-sage hover:text-warm-white text-xs h-9">
              My Profile
            </Button>
          </Link>
          <Link to="/candidate/resume">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-1.5 text-xs h-9 shadow-md shadow-emerald-500/10">
              <Upload className="w-3.5 h-3.5" />
              Manage Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Quality Score */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-sage-muted uppercase tracking-wider">Quality Score</span>
              <h3 className="text-2xl font-extrabold text-warm-white font-mono">
                {qualityScore !== null && qualityScore !== undefined ? `${qualityScore}%` : 'N/A'}
              </h3>
              <Link to="/candidate/quality" className="text-[10px] text-emerald-400 hover:underline block font-medium">
                View Quality Breakdown →
              </Link>
            </div>
            <ScoreCircle score={qualityScore || 0} size={54} />
          </CardContent>
        </Card>

        {/* Metric 2: ATS Score */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-sage-muted uppercase tracking-wider">ATS Score</span>
              <h3 className="text-2xl font-extrabold text-warm-white font-mono">
                {atsScore !== null && atsScore !== undefined ? `${atsScore}%` : 'N/A'}
              </h3>
              <Link to="/candidate/ats-score" className="text-[10px] text-champagne hover:underline block font-medium">
                View ATS Checklist →
              </Link>
            </div>
            <ScoreCircle score={atsScore || 0} size={54} />
          </CardContent>
        </Card>

        {/* Metric 3: Skills Detected */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-sage-muted uppercase tracking-wider">Skills Extracted</span>
              <h3 className="text-2xl font-extrabold text-warm-white font-mono">{skillsCount}</h3>
              <Link to="/candidate/profile" className="text-[10px] text-sage hover:underline block font-medium">
                View Profile Skills →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Applications Count */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-sage-muted uppercase tracking-wider">Applied Positions</span>
              <h3 className="text-2xl font-extrabold text-warm-white font-mono">{applications.length}</h3>
              <Link to="/candidate/applications" className="text-[10px] text-blue-400 hover:underline block font-medium">
                View Applications →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Split: AI Job Matches & Applied Jobs / Interview Prep */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top AI Matched Openings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-warm-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Job Matches
            </h2>
            <Link to="/candidate/recommended-jobs" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Find More Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map((j: any) => (
                <Card key={j.job_id || j.id} className="bg-charcoal border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-warm-white">{j.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono">
                          {j.match_score}% Match
                        </span>
                      </div>
                      <p className="text-xs text-sage font-medium">{j.company} • {j.location}</p>
                      <p className="text-[11px] text-sage-muted">{j.explanation}</p>
                    </div>

                    <Link to="/candidate/recommended-jobs">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-8 shrink-0">
                        View & Apply
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-charcoal border-obsidian-border p-6 text-center text-xs text-sage-muted">
                No active openings currently matched to your skill profile. Explore all positions in Job Search.
              </Card>
            )}
          </div>
        </div>

        {/* Right: Applications & Interview Prep Availability */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-warm-white uppercase tracking-wider">
            Interview Center
          </h2>

          {applications.length > 0 ? (
            <Card className="bg-gradient-to-br from-charcoal to-charcoal-light border border-champagne/30 shadow-xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-champagne/15 text-champagne flex items-center justify-center border border-champagne/30">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-warm-white">AI Voice Interview Ready</h4>
                <p className="text-xs text-sage-muted mt-1 leading-relaxed">
                  Interview preparation unlocked for your applied position: <span className="text-warm-white font-semibold">{applications[0].job_title}</span>.
                </p>
              </div>
              <Link to={`/candidate/interview-prep?jobId=${applications[0].job_id}`}>
                <Button size="sm" className="w-full bg-champagne hover:bg-champagne-light text-obsidian font-bold text-xs">
                  Launch Interview Prep →
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="bg-charcoal border-obsidian-border p-5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-charcoal-light text-sage-muted flex items-center justify-center border border-obsidian-border">
                <Mic className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-warm-white">Interview Preparation</h4>
                <p className="text-xs text-sage-muted mt-1 leading-relaxed">
                  Apply for a job to activate personalized AI interview preparation and speech mock sessions.
                </p>
              </div>
              <Link to="/candidate/recommended-jobs">
                <Button size="sm" variant="outline" className="w-full border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-xs">
                  Browse & Apply to Jobs
                </Button>
              </Link>
            </Card>
          )}

          <Card className="bg-charcoal border-emerald-500/10 shadow-xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-warm-white">Explore All Job Positions</h4>
              <p className="text-xs text-sage-muted mt-1 leading-relaxed">
                Search openings across any title or city with custom filters.
              </p>
            </div>
            <Link to="/candidate/recommended-jobs">
              <Button size="sm" variant="outline" className="w-full border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-xs">
                Search Jobs
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
