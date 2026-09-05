import React, { useEffect, useState, useRef } from 'react'
import { getMyProfile, uploadMyResume, getMyResumes, deleteMyResume } from '@/api/candidates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  X,
  FileCheck2,
  Layers,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const MyResumePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null)
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Selected file for staging
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pData, rData] = await Promise.all([
        getMyProfile(),
        getMyResumes()
      ])
      setProfileData(pData)
      setResumes(rData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
      toast.error('File size exceeds the 10MB limit.')
      return
    }
    setSelectedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndStageFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndStageFile(e.dataTransfer.files[0])
    }
  }

  const handleExecuteUpload = async () => {
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
        'Preparing Interview Insights...',
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
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchData()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to process resume'
      toast.error(msg)
    } finally {
      setUploading(false)
      setProcessingStep('')
    }
  }

  const handleDeleteVersion = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resume version?')) return
    try {
      await deleteMyResume(id)
      toast.success('Resume version removed')
      fetchData()
    } catch {
      toast.error('Failed to delete resume')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  const hasResume = profileData?.has_resume === true
  const activeResume = profileData?.resume
  const candidate = profileData?.candidate

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-emerald-400" />
          Resume Management & Ingestion
        </h1>
        <p className="text-xs text-sage-muted">
          Upload and manage your resume documents to drive automated ATS screening and AI matching
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="bg-charcoal border-emerald-500/20 shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            {hasResume ? 'Upload New Resume Version' : 'Upload Your Resume'}
          </CardTitle>
          <CardDescription className="text-xs text-sage-muted">
            Accepts PDF, DOCX, or TXT (Max 10MB)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
              onChange={handleFileChange}
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
                Accepts PDF, DOCX, or TXT documents up to 10MB
              </p>
            </div>
          </div>

          {/* Staged File Card Before Upload */}
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
                  onClick={handleExecuteUpload}
                  className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-5 shadow-md shadow-emerald-500/15"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload & Run AI Analysis
                </Button>
              </div>
            </div>
          )}

          {/* Processing Animation */}
          {uploading && (
            <div className="p-6 rounded-xl bg-charcoal-light border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                  {processingStep}
                </span>
                <span className="text-xs text-sage-muted font-mono">Real-time NLP Pipeline</span>
              </div>
              <div className="w-full bg-obsidian rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-400 h-2 rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-[11px] text-sage-muted italic">
                Extracting entity tokens, normalizing skill taxonomies, and computing ATS compatibility...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Resume Card (If Uploaded) */}
      {hasResume && activeResume && (
        <Card className="bg-charcoal border-emerald-500/30 shadow-xl overflow-hidden">
          <CardHeader className="bg-charcoal-light/40 border-b border-obsidian-border p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-warm-white text-base">{activeResume.filename}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      CURRENT ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-sage-muted mt-0.5">
                    Analyzed on {new Date(activeResume.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-sage-muted block uppercase">Quality Score</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">
                    {activeResume.quality_score || 0}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-sage-muted block uppercase">ATS Score</span>
                  <span className="text-lg font-extrabold text-champagne font-mono">
                    {activeResume.ats_score || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {/* Extracted Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-charcoal-light/60 border border-obsidian-border">
                <span className="text-[10px] font-semibold text-sage-muted uppercase block">Extracted Name</span>
                <span className="text-xs font-bold text-warm-white">{candidate?.full_name || 'Not detected'}</span>
              </div>
              <div className="p-3 rounded-lg bg-charcoal-light/60 border border-obsidian-border">
                <span className="text-[10px] font-semibold text-sage-muted uppercase block">Contact Email</span>
                <span className="text-xs font-bold text-warm-white truncate block">{candidate?.email || 'Not detected'}</span>
              </div>
              <div className="p-3 rounded-lg bg-charcoal-light/60 border border-obsidian-border">
                <span className="text-[10px] font-semibold text-sage-muted uppercase block">Location</span>
                <span className="text-xs font-bold text-warm-white">{candidate?.location || 'Manual entry'}</span>
              </div>
            </div>

            {/* Extracted Skills Preview */}
            {candidate?.skills && candidate.skills.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-warm-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Extracted Skill Entities ({candidate.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s: any, idx: number) => {
                    const name = typeof s === 'string' ? s : s.name
                    return (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                        {name}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Link Buttons */}
            <div className="pt-3 flex flex-wrap gap-2 border-t border-obsidian-border">
              <Link to="/candidate/quality">
                <Button size="sm" variant="outline" className="text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> View Quality Report
                </Button>
              </Link>
              <Link to="/candidate/ats-score">
                <Button size="sm" variant="outline" className="text-xs border-champagne/20 text-champagne hover:bg-champagne/10">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> View ATS Checklist
                </Button>
              </Link>
              <Link to="/candidate/recommended-jobs">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs">
                  <Briefcase className="w-3.5 h-3.5 mr-1" /> View AI Job Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History Table — ONLY IF HAS RESUME */}
      {hasResume && resumes.length > 0 && (
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-warm-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Resume Version History ({resumes.length})
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">
              The latest uploaded document acts as your primary screening resume
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <div className="space-y-2">
              {resumes.map((r, idx) => (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    r.is_current
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-obsidian-border bg-charcoal-light/40 hover:border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${r.is_current ? 'text-emerald-400' : 'text-sage-muted'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-warm-white">{r.filename}</span>
                        <span className="text-[10px] font-mono text-sage-muted">{r.version_name}</span>
                        {r.is_current && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-sage-muted font-mono block">
                        {(r.file_size / 1024).toFixed(1)} KB • {r.file_type?.toUpperCase()} • {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-sage-muted block">ATS Score</span>
                      <span className="text-xs font-bold text-champagne font-mono">{r.ats_score || 'N/A'}%</span>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteVersion(r.id)}
                      className="text-sage-muted hover:text-coral h-8 w-8 rounded-lg"
                      title="Delete version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
