import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '@/api/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sparkles, Bot, Plus, X, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [experienceRequired, setExperienceRequired] = useState('3+ years')
  const [salaryRange, setSalaryRange] = useState('$100,000 - $130,000')
  const [requiredEducation, setRequiredEducation] = useState("Bachelor's in Computer Science or related")
  
  const [reqSkills, setReqSkills] = useState<string[]>(['Python', 'SQL', 'FastAPI'])
  const [prefSkills, setPrefSkills] = useState<string[]>(['Docker', 'AWS', 'PostgreSQL'])
  const [newReq, setNewReq] = useState('')
  const [newPref, setNewPref] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddReq = () => {
    if (newReq && !reqSkills.includes(newReq)) {
      setReqSkills([...reqSkills, newReq])
      setNewReq('')
    }
  }

  const handleAddPref = () => {
    if (newPref && !prefSkills.includes(newPref)) {
      setPrefSkills([...prefSkills, newPref])
      setNewPref('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !company || !description) {
      toast.error('Please fill in Title, Company, and Description')
      return
    }

    try {
      setLoading(true)
      await createJob({
        title,
        company,
        location,
        description,
        employment_type: employmentType,
        experience_required: experienceRequired,
        salary_range: salaryRange,
        required_education: requiredEducation,
        required_skills: reqSkills,
        preferred_skills: prefSkills,
        status: 'active'
      })
      toast.success('Job created & AI analyzed successfully!')
      navigate('/recruiter/jobs')
    } catch {
      toast.error('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          Create New Job Position
        </h1>
        <p className="text-xs text-sage-muted">Provide job requirements for automated candidate screening & scoring</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Job Title *</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer"
                  required
                  className="bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Company Name *</Label>
                <Input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. TechCorp Solutions"
                  required
                  className="bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Location</Label>
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Remote / New York"
                  className="bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Experience Required</Label>
                <Input
                  value={experienceRequired}
                  onChange={e => setExperienceRequired(e.target.value)}
                  placeholder="e.g. 3+ years"
                  className="bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-sage-muted">Salary Range</Label>
                <Input
                  value={salaryRange}
                  onChange={e => setSalaryRange(e.target.value)}
                  placeholder="e.g. $120k - $150k"
                  className="bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-sage-muted">Job Description & Responsibilities *</Label>
              <Textarea
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Paste or write detailed job requirements, responsibilities, and qualifications..."
                required
                className="bg-charcoal-light border-emerald-500/20 text-warm-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skill Taxonomy Inputs */}
        <Card className="bg-charcoal border-emerald-500/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-warm-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Required & Preferred Skills
            </CardTitle>
            <CardDescription className="text-xs text-sage-muted">Used for exact NER extraction and semantic similarity weighting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-sage-muted">Mandatory / Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newReq}
                  onChange={e => setNewReq(e.target.value)}
                  placeholder="Add required skill (e.g. Python)"
                  className="h-9 text-xs bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
                <Button type="button" size="sm" onClick={handleAddReq} variant="outline" className="text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {reqSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {s}
                    <button type="button" onClick={() => setReqSkills(reqSkills.filter(x => x !== s))}><X className="w-3 h-3 hover:text-coral-400" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-sage-muted">Preferred / Nice-to-Have Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newPref}
                  onChange={e => setNewPref(e.target.value)}
                  placeholder="Add preferred skill (e.g. Docker)"
                  className="h-9 text-xs bg-charcoal-light border-emerald-500/20 text-warm-white"
                />
                <Button type="button" size="sm" onClick={handleAddPref} variant="outline" className="text-xs border-champagne/20 text-champagne hover:bg-champagne/10">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {prefSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-champagne/15 text-champagne border border-champagne/30">
                    {s}
                    <button type="button" onClick={() => setPrefSkills(prefSkills.filter(x => x !== s))}><X className="w-3 h-3 hover:text-coral-400" /></button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/recruiter/jobs')} className="border-emerald-500/20 text-sage hover:text-warm-white">
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-obsidian font-bold" disabled={loading}>
            {loading ? 'Creating Position...' : 'Publish Job Position'}
          </Button>
        </div>
      </form>
    </div>
  )
}
