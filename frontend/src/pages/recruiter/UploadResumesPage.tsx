import React, { useEffect, useState } from 'react'
import { getJobs } from '@/api/jobs'
import { uploadResumes } from '@/api/resumes'
import { Job } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export const UploadResumesPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    getJobs().then(data => {
      setJobs(data || [])
      if (data && data.length > 0) setSelectedJob(data[0].id)
    })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one resume file')
      return
    }

    try {
      setUploading(true)
      const res = await uploadResumes(files, selectedJob)
      setResults(res)
      toast.success(`${files.length} resumes parsed and evaluated!`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-emerald-400" />
          Batch Resume Upload & AI Parsing
        </h1>
        <p className="text-xs text-sage-muted">Upload multiple PDF/DOCX resumes for instant NER parsing and semantic screening</p>
      </div>

      <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-warm-white">Target Position</CardTitle>
          <CardDescription className="text-xs text-sage-muted">Select which job requirement to screen candidate resumes against</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-emerald-500/20 bg-charcoal-light text-warm-white text-sm font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id} className="bg-charcoal text-warm-white">
                {j.title} ({j.company})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Upload Dropzone */}
      <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
        <CardContent className="p-8">
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-500/30 rounded-2xl bg-charcoal-light/40 hover:bg-charcoal-light hover:border-emerald-500/60 transition-all cursor-pointer">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/10 mb-3 border border-emerald-500/30">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-warm-white">Drop resumes here or click to browse</p>
            <p className="text-xs text-sage-muted mt-1">Supports PDF, DOCX, TXT (up to 10MB per file)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Selected File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sage">Selected Files ({files.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-emerald-500/10 rounded-xl p-3 bg-charcoal-light">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-warm-white bg-charcoal p-2 rounded-lg border border-emerald-500/10">
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {f.name}
                    </span>
                    <span className="text-sage-muted font-mono text-[10px]">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {uploading ? 'Processing & Screening...' : `Screen ${files.length} Resumes with AI`}
                </Button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {results && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> Screening Pipeline Complete!
              </div>
              <p className="text-xs text-sage-muted">
                Candidate profiles have been parsed, NLP entities extracted, and semantic scores calculated.
              </p>
              <Link to="/recruiter/ranking">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-1 text-xs mt-2">
                  View Candidate Rankings <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
