import React, { useEffect, useState } from 'react'
import { getMyRecommendations, applyForJob, getMyProfile, searchCandidateJobs } from '@/api/candidates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Briefcase,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Layers,
  X,
  Upload,
  Search,
  Check,
  Mic
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const RecommendedJobsPage: React.FC = () => {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'matches' | 'search'>('matches')
  const [loading, setLoading] = useState(true)

  // AI Matched Jobs State
  const [matchedJobs, setMatchedJobs] = useState<any[]>([])

  // Flexible Search State
  const [searchTitleSelect, setSearchTitleSelect] = useState('all')
  const [customTitle, setCustomTitle] = useState('')
  const [searchLocationSelect, setSearchLocationSelect] = useState('all')
  const [customLocation, setCustomLocation] = useState('')
  const [workMode, setWorkMode] = useState('any')
  const [experienceLevel, setExperienceLevel] = useState('any')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Apply Modal State
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applying, setApplying] = useState(false)
  const [showResumeRequiredModal, setShowResumeRequiredModal] = useState(false)
  const [justAppliedJob, setJustAppliedJob] = useState<any>(null)

  const commonTitles = [
    'Data Analyst',
    'Data Scientist',
    'Data Engineer',
    'Machine Learning Engineer',
    'AI Engineer',
    'Software Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Python Developer',
    'Business Analyst',
    'Business Intelligence Analyst',
    'Product Analyst',
    'DevOps Engineer',
    'Cloud Engineer',
    'UI/UX Designer',
    'Computer Vision Engineer'
  ]

  const commonLocations = [
    'Chennai',
    'Bangalore',
    'Hyderabad',
    'Mumbai',
    'Pune',
    'Delhi',
    'Coimbatore',
    'Madurai',
    'Salem',
    'Trichy',
    'Remote',
    'Hybrid'
  ]

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const pData = await getMyProfile()
      setProfileData(pData)

      if (pData?.has_resume) {
        const mData = await getMyRecommendations()
        setMatchedJobs(mData || [])
      }

      const sData = await searchCandidateJobs({})
      setSearchResults(sData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const handleSearch = async () => {
    try {
      setSearching(true)
      const effectiveTitle = searchTitleSelect === 'other' ? customTitle : (searchTitleSelect === 'all' ? '' : searchTitleSelect)
      const effectiveLocation = searchLocationSelect === 'other' ? customLocation : (searchLocationSelect === 'all' ? '' : searchLocationSelect)

      const data = await searchCandidateJobs({
        title: effectiveTitle,
        location: effectiveLocation,
        work_mode: workMode,
        experience: experienceLevel
      })
      setSearchResults(data || [])
      setActiveTab('search')
    } catch (err) {
      console.error(err)
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleInitiateApply = (job: any) => {
    if (!profileData?.has_resume) {
      setShowResumeRequiredModal(true)
      return
    }
    setSelectedJob(job)
  }

  const handleConfirmApply = async () => {
    if (!selectedJob) return
    try {
      setApplying(true)
      await applyForJob(selectedJob.job_id || selectedJob.id)
      toast.success(`Application submitted for ${selectedJob.title}! Interview Prep is now unlocked for this role.`)
      setJustAppliedJob(selectedJob)
      setSelectedJob(null)
      loadInitialData()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Application failed'
      toast.error(msg)
    } finally {
      setApplying(false)
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
  const currentResume = profileData?.resume

  if (!hasResume) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            AI Job Matches
          </h1>
          <p className="text-xs text-sage-muted">Discover positions matching your verified skills and qualifications</p>
        </div>

        <Card className="bg-charcoal border-obsidian-border shadow-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-light border border-obsidian-border flex items-center justify-center text-sage-muted mx-auto">
            <Briefcase className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-warm-white text-lg">Resume Required</h3>
            <p className="text-xs text-sage-muted max-w-md mx-auto leading-relaxed">
              Please upload your resume first to access this feature. Upload your resume to receive AI-powered job matches.
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            Job Opportunities & AI Matching
          </h1>
          <p className="text-xs text-sage-muted">
            Explore live positions or inspect semantic AI matches computed directly against your resume
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-charcoal p-1 rounded-xl border border-emerald-500/15">
          <Button
            size="sm"
            variant={activeTab === 'matches' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('matches')}
            className={`text-xs h-8 ${activeTab === 'matches' ? 'bg-emerald-500 text-obsidian font-bold' : 'text-sage-muted'}`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Job Matches
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('search')}
            className={`text-xs h-8 ${activeTab === 'search' ? 'bg-emerald-500 text-obsidian font-bold' : 'text-sage-muted'}`}
          >
            <Search className="w-3.5 h-3.5 mr-1" />
            Search All Jobs
          </Button>
        </div>
      </div>

      {/* Post-Apply Celebration Banner */}
      {justAppliedJob && (
        <Card className="bg-charcoal border-champagne/40 shadow-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-champagne" />
              <span className="text-xs font-bold uppercase tracking-wider text-champagne">Application Submitted</span>
            </div>
            <h4 className="text-sm font-bold text-warm-white">
              Applied for {justAppliedJob.title} at {justAppliedJob.company}
            </h4>
            <p className="text-xs text-sage-muted">
              Application status: <span className="text-emerald-400 font-bold">Applied</span>. AI Interview Preparation is now ready!
            </p>
          </div>

          <Link to={`/candidate/interview-prep?jobId=${justAppliedJob.job_id || justAppliedJob.id}`}>
            <Button size="sm" className="bg-champagne hover:bg-champagne-light text-obsidian font-bold text-xs h-9 px-4 gap-1.5 shrink-0">
              <Mic className="w-3.5 h-3.5" /> Start Interview Prep →
            </Button>
          </Link>
        </Card>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: AI JOB MATCHES                                               */}
      {/* ==================================================================== */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {!hasResume ? (
            <Card className="bg-charcoal border-obsidian-border shadow-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-charcoal-light border border-obsidian-border flex items-center justify-center text-sage-muted mx-auto">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-warm-white text-lg">Upload your resume to receive AI-powered job matches.</h3>
                <p className="text-xs text-sage-muted max-w-md mx-auto leading-relaxed">
                  AI Job Matching compares your uploaded resume, skills, experience, education, and location with job requirements to calculate accurate match scores.
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
          ) : matchedJobs.length > 0 ? (
            <div className="space-y-3">
              {matchedJobs.map((j: any) => (
                <Card key={j.job_id || j.id} className="bg-charcoal border-emerald-500/15 hover:border-emerald-500/30 shadow-xl transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-warm-white text-base">{j.title}</h3>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            {j.match_score}% MATCH
                          </span>
                        </div>
                        <p className="text-xs text-sage font-medium flex items-center gap-2">
                          <span>{j.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                          <span>•</span>
                          <span>{j.employment_type || 'Full-time'}</span>
                          {j.salary_range && (
                            <>
                              <span>•</span>
                              <span>{j.salary_range}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleInitiateApply(j)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-5 shadow-md shadow-emerald-500/15 shrink-0"
                      >
                        Apply
                      </Button>
                    </div>

                    {/* Match Breakdown & Explanation */}
                    <div className="p-3.5 rounded-xl bg-charcoal-light/60 border border-obsidian-border space-y-2">
                      <p className="text-xs text-warm-white font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-champagne" /> {j.explanation}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="font-semibold text-emerald-400">Matching Skills:</span>
                        {(j.matched_skills || []).slice(0, 6).map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                            {s}
                          </span>
                        ))}

                        {j.missing_skills && j.missing_skills.length > 0 && (
                          <>
                            <span className="font-semibold text-amber-400 ml-2">Missing Skills:</span>
                            {j.missing_skills.slice(0, 4).map((s: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                                {s}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-charcoal border-obsidian-border p-8 text-center text-xs text-sage-muted">
              No active jobs matched your current skill set. Check back soon or search positions in the Job Search tab.
            </Card>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SEARCH ALL JOBS (FLEXIBLE: ANY TITLE & ANY LOCATION)          */}
      {/* ==================================================================== */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          {/* Flexible Search Control Panel */}
          <Card className="bg-charcoal border-emerald-500/20 shadow-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sage-muted flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Search & Filter Jobs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Job Title Selector + Other */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-muted">Job Title</label>
                <select
                  value={searchTitleSelect}
                  onChange={e => setSearchTitleSelect(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                >
                  <option value="all">Any Job Title</option>
                  {commonTitles.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {searchTitleSelect === 'other' && (
                  <Input
                    placeholder="Enter your job title"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="h-8 text-xs bg-charcoal border-emerald-500/30 text-warm-white mt-1.5"
                  />
                )}
              </div>

              {/* 2. Location Selector + Other */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-muted">Location</label>
                <select
                  value={searchLocationSelect}
                  onChange={e => setSearchLocationSelect(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                >
                  <option value="all">Any Location</option>
                  {commonLocations.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {searchLocationSelect === 'other' && (
                  <Input
                    placeholder="Enter your location"
                    value={customLocation}
                    onChange={e => setCustomLocation(e.target.value)}
                    className="h-8 text-xs bg-charcoal border-emerald-500/30 text-warm-white mt-1.5"
                  />
                )}
              </div>

              {/* 3. Work Mode */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-muted">Work Type</label>
                <select
                  value={workMode}
                  onChange={e => setWorkMode(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                >
                  <option value="any">Any Work Type</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </select>
              </div>

              {/* 4. Experience Level */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-muted">Experience</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md bg-charcoal-light border border-emerald-500/20 text-warm-white outline-none"
                >
                  <option value="any">Any Experience</option>
                  <option value="fresher">Fresher (0 yrs)</option>
                  <option value="0-2">0 - 2 Years</option>
                  <option value="2-5">2 - 5 Years</option>
                  <option value="5+">5+ Years</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleSearch}
                disabled={searching}
                className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-6 shadow-md shadow-emerald-500/10"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                {searching ? 'Searching...' : 'SEARCH JOBS'}
              </Button>
            </div>
          </Card>

          {/* Search Results List */}
          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((j: any) => (
                <Card key={j.id || j.job_id} className="bg-charcoal border-emerald-500/10 hover:border-emerald-500/30 p-5 space-y-3 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-warm-white text-base">{j.title}</h3>
                        {j.match_score !== null && j.match_score !== undefined ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            {j.match_score}% Match
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-charcoal-light text-sage-muted border border-obsidian-border">
                            Upload resume to receive AI match score
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sage font-medium flex items-center gap-2">
                        <span>{j.company}</span>
                        <span>•</span>
                        <span>{j.location}</span>
                        <span>•</span>
                        <span>{j.salary_range || '$90,000 - $130,000'}</span>
                      </p>
                    </div>

                    <Button
                      onClick={() => handleInitiateApply(j)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-8 px-4 shrink-0"
                    >
                      Apply
                    </Button>
                  </div>

                  <p className="text-xs text-sage-muted leading-relaxed line-clamp-2">
                    {j.description}
                  </p>

                  {j.required_skills && j.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {j.required_skills.map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-light text-sage border border-obsidian-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="bg-charcoal border-obsidian-border p-8 text-center text-xs text-sage-muted">
                No job openings matched your search filters. Try adjusting keywords or location.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* APPLICATION CONFIRMATION MODAL                                       */}
      {/* ==================================================================== */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-charcoal border-emerald-500/30 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-obsidian-border pb-3">
              <div>
                <h3 className="font-bold text-warm-white text-base">Confirm Application</h3>
                <p className="text-xs text-sage-muted">{selectedJob.title} at {selectedJob.company}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedJob(null)} className="text-sage-muted hover:text-warm-white h-7 w-7">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-light border border-obsidian-border space-y-2">
              <span className="text-[10px] font-semibold text-sage-muted uppercase block">Applying with Current Resume</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-warm-white">{currentResume?.filename || 'Active Resume'}</span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {selectedJob.match_score ? `${selectedJob.match_score}% Match` : 'Ready to Screen'}
                </span>
              </div>
            </div>

            <p className="text-xs text-sage-muted leading-relaxed">
              Applying for this position will submit your resume and unlock personalized AI Interview Preparation tailored specifically to this job role.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)} className="text-xs text-sage-muted">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApply}
                disabled={applying}
                className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-5"
              >
                {applying ? 'Submitting...' : 'Confirm & Submit Application'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* RESUME REQUIRED MODAL                                                */}
      {/* ==================================================================== */}
      {showResumeRequiredModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-charcoal border-amber-500/30 max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warm-white text-base">Resume Required</h3>
              <p className="text-xs text-sage-muted leading-relaxed">
                Please upload your resume before applying to jobs. Applications require an uploaded resume for automated candidate screening.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowResumeRequiredModal(false)} className="text-xs text-sage-muted">
                Close
              </Button>
              <Link to="/candidate/resume">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold text-xs h-9 px-5">
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Resume
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
