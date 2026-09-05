import React, { useEffect, useState } from 'react'
import { getMyProfile, updateMyProfile } from '@/api/candidates'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

export const MyProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [totalExperience, setTotalExperience] = useState('0')

  // Skills
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  // Experience Entries
  const [experiences, setExperiences] = useState<any[]>([])
  // Education Entries — Always start with at least 1 education card by default
  const [education, setEducation] = useState<any[]>([
    { degree: '', institution: '', field_of_study: '', start_year: '', end_year: '', gpa: '' }
  ])
  // Projects
  const [projects, setProjects] = useState<any[]>([])
  // Certifications
  const [certifications, setCertifications] = useState<any[]>([])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getMyProfile()
      const c = data.candidate
      setFullName(c.full_name || user?.full_name || '')
      setEmail(c.email || user?.email || '')
      setPhone(c.phone || '')
      setLocation(c.location || '')
      setLinkedin(c.linkedin || '')
      setGithub(c.github || '')
      setPortfolio(c.portfolio || '')
      setHeadline(c.headline || '')
      setSummary(c.summary || '')
      setTotalExperience(String(c.total_experience_years || 0))
      
      const parsedSkills = (c.skills || []).map((s: any) => typeof s === 'string' ? s : s.name)
      setSkills(parsedSkills)
      setExperiences(c.experience || [])
      
      const eduList = c.education && c.education.length > 0
        ? c.education.map((e: any) => ({
            degree: e.degree || '',
            institution: e.institution || '',
            field_of_study: e.field_of_study || '',
            start_year: e.start_year || '',
            end_year: e.end_year || e.graduation_year || '',
            gpa: e.gpa || ''
          }))
        : [{ degree: '', institution: '', field_of_study: '', start_year: '', end_year: '', gpa: '' }]
      setEducation(eduList)
      setProjects(c.projects || [])
      setCertifications(c.certifications || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter(x => x !== s))
  }

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      { company: '', job_title: '', duration_months: 12, description: '', technologies: [] }
    ])
  }

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: '', institution: '', field_of_study: '', start_year: '', end_year: '', gpa: '' }
    ])
  }

  const handleRemoveEducation = (idx: number) => {
    const updated = education.filter((_, i) => i !== idx)
    // If all are removed, reset to one blank card
    if (updated.length === 0) {
      setEducation([{ degree: '', institution: '', field_of_study: '', start_year: '', end_year: '', gpa: '' }])
    } else {
      setEducation(updated)
    }
  }

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: '', description: '', technologies: [] }
    ])
  }

  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      { name: '', issuing_organization: '', year: new Date().getFullYear(), credential_id: '' }
    ])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        full_name: fullName,
        phone,
        location,
        linkedin,
        github,
        portfolio,
        headline,
        summary,
        total_experience_years: parseFloat(totalExperience) || 0,
        skills,
        experience: experiences,
        education,
        projects,
        certifications
      }
      await updateMyProfile(payload)
      if (user) {
        setUser({ ...user, full_name: fullName })
      }
      toast.success('Profile saved successfully!')
      fetchProfile()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sage-muted text-xs">Loading profile information...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-emerald-400" />
            My Candidate Profile
          </h1>
          <p className="text-xs text-sage-muted">Manage your personal information, technical skills, and career background</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold gap-2 text-xs h-9 shadow-md shadow-emerald-500/10">
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving Changes...' : 'Save Profile'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Information */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Your direct contact details and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Full Name *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Divasini G" required className="bg-charcoal-light border-emerald-500/20 text-warm-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Email Address (Read-only)</Label>
                <Input value={email} disabled className="bg-charcoal-light/60 border-emerald-500/10 text-sage-muted font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" className="bg-charcoal-light border-emerald-500/20 text-warm-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Location (City, State, Country) *</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Chennai, Tamil Nadu, India" className="bg-charcoal-light border-emerald-500/20 text-warm-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">LinkedIn URL</Label>
                <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/username" className="bg-charcoal-light border-emerald-500/20 text-warm-white text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">GitHub URL</Label>
                <Input value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/username" className="bg-charcoal-light border-emerald-500/20 text-warm-white text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Portfolio / Website</Label>
                <Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://yourportfolio.dev" className="bg-charcoal-light border-emerald-500/20 text-warm-white text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Summary */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Professional Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-sage-muted">Professional Headline</Label>
                <Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Senior AI Engineer & Full Stack Developer" className="bg-charcoal-light border-emerald-500/20 text-warm-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Total Experience (Years)</Label>
                <Input type="number" step="0.5" min="0" value={totalExperience} onChange={e => setTotalExperience(e.target.value)} placeholder="e.g. 4.0" className="bg-charcoal-light border-emerald-500/20 text-warm-white font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-sage-muted">Career Summary</Label>
              <Textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief executive summary highlighting your background, core focus, and achievements..." className="bg-charcoal-light border-emerald-500/20 text-warm-white" />
            </div>
          </CardContent>
        </Card>

        {/* Technical Skills */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Skills & Competencies
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Used by the semantic matching engine to find recommended jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}} placeholder="Add a technical skill (e.g. Python, PyTorch, React, SQL)..." className="h-9 text-xs bg-charcoal-light border-emerald-500/20 text-warm-white" />
              <Button type="button" size="sm" onClick={handleAddSkill} variant="outline" className="text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="text-sage-muted hover:text-coral-400 font-bold ml-1">×</button>
                </span>
              ))}
              {skills.length === 0 && (
                <p className="text-xs text-sage-muted italic">No skills added yet. Add skills or upload a resume to automatically extract them.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Experience Section */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Work Experience
              </CardTitle>
              <CardDescription className="text-xs text-sage-muted">Your employment history and impact</CardDescription>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddExperience} className="text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-charcoal-light border border-emerald-500/10 space-y-3 relative">
                <button type="button" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-sage-muted hover:text-coral-400">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">Job Title</Label>
                    <Input value={exp.job_title || ''} onChange={e => {
                      const updated = [...experiences]; updated[idx].job_title = e.target.value; setExperiences(updated);
                    }} placeholder="e.g. Senior AI Engineer" className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">Company Name</Label>
                    <Input value={exp.company || ''} onChange={e => {
                      const updated = [...experiences]; updated[idx].company = e.target.value; setExperiences(updated);
                    }} placeholder="e.g. NeuralTech Solutions" className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-sage-muted">Responsibilities & Key Metrics</Label>
                  <Textarea rows={2} value={exp.description || ''} onChange={e => {
                    const updated = [...experiences]; updated[idx].description = e.target.value; setExperiences(updated);
                  }} placeholder="Describe your key achievements, architecture decisions, and business outcomes..." className="text-xs bg-charcoal border-emerald-500/20 text-warm-white" />
                </div>
              </div>
            ))}
            {experiences.length === 0 && (
              <p className="text-xs text-sage-muted italic text-center py-2">No work experiences added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                Education History
              </CardTitle>
              <CardDescription className="text-xs text-sage-muted">Academic background, degrees, and institutions</CardDescription>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleAddEducation} className="text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Education
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-charcoal-light border border-emerald-500/10 space-y-3 relative">
                <div className="flex items-center justify-between pr-8">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Education {idx + 1}
                  </span>
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-3 right-3 text-sage-muted hover:text-coral-400 transition-colors"
                      title="Remove Education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">Degree / Qualification *</Label>
                    <Input
                      value={edu.degree || ''}
                      onChange={e => {
                        const updated = [...education]; updated[idx].degree = e.target.value; setEducation(updated);
                      }}
                      placeholder="e.g. B.Tech, M.S., Bachelor of Science"
                      className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">Field of Study / Major</Label>
                    <Input
                      value={edu.field_of_study || ''}
                      onChange={e => {
                        const updated = [...education]; updated[idx].field_of_study = e.target.value; setEducation(updated);
                      }}
                      placeholder="e.g. Computer Science & Engineering"
                      className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-sage-muted">Institution / College / University *</Label>
                  <Input
                    value={edu.institution || ''}
                    onChange={e => {
                      const updated = [...education]; updated[idx].institution = e.target.value; setEducation(updated);
                    }}
                    placeholder="e.g. Stanford University / Anna University"
                    className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">Start Year</Label>
                    <Input
                      value={edu.start_year || ''}
                      onChange={e => {
                        const updated = [...education]; updated[idx].start_year = e.target.value; setEducation(updated);
                      }}
                      placeholder="e.g. 2018"
                      className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">End Year / Expected</Label>
                    <Input
                      value={edu.end_year || ''}
                      onChange={e => {
                        const updated = [...education]; updated[idx].end_year = e.target.value; setEducation(updated);
                      }}
                      placeholder="e.g. 2022"
                      className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-sage-muted">CGPA / Percentage</Label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={e => {
                        const updated = [...education]; updated[idx].gpa = e.target.value; setEducation(updated);
                      }}
                      placeholder="e.g. 8.8/10 or 85%"
                      className="h-8 text-xs bg-charcoal border-emerald-500/20 text-warm-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold px-8 shadow-lg shadow-emerald-500/10">
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
