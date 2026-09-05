export interface User {
  id: string
  email: string
  full_name: string
  role: 'recruiter' | 'candidate' | 'admin'
  is_active: boolean
  created_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  employment_type: string
  experience_required: string
  salary_range: string
  required_skills: string[]
  preferred_skills: string[]
  required_education: string
  responsibilities: string[]
  status: 'active' | 'closed' | 'draft'
  recruiter_id: string
  candidate_count?: number
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  location: string | null
  linkedin: string | null
  github: string | null
  portfolio: string | null
  total_experience_years: number | null
  parsed_data: any
  skills?: Skill[]
  experiences?: Experience[]
  education_entries?: Education[]
  projects?: Project[]
  certifications?: Certification[]
  created_at: string
}

export interface Resume {
  id: string
  candidate_id: string
  filename: string
  file_path: string
  file_type: string
  file_size: number
  raw_text: string | null
  parsed_sections: any
  quality_score: number | null
  ats_score: number | null
  improvement_suggestions: string[] | null
  is_processed: boolean
  created_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  proficiency_level?: string
}

export interface Experience {
  id: string
  company: string
  job_title: string
  start_date: string | null
  end_date: string | null
  duration_months: number | null
  is_current: boolean
  description: string | null
  technologies: string[]
}

export interface Education {
  id: string
  degree: string
  field_of_study: string | null
  institution: string
  graduation_year: number | null
  gpa: string | null
}

export interface Project {
  id: string
  title: string
  description: string | null
  technologies: string[]
  role: string | null
}

export interface Certification {
  id: string
  name: string
  issuing_organization: string | null
  year: number | null
}

export interface Application {
  id: string
  candidate_id: string
  job_id: string
  resume_id: string
  status: string
  applied_at: string
  candidate?: Candidate
  job?: Job
  screening_result?: ScreeningResult
  candidate_status?: CandidateStatusInfo
}

export interface ScreeningResult {
  id: string
  application_id: string
  overall_score: number
  skills_score: number
  experience_score: number
  education_score: number
  project_score: number
  certification_score: number
  semantic_similarity_score: number
  matched_skills: string[]
  missing_skills: string[]
  experience_analysis: any
  education_analysis: any
  project_analysis: any
  certification_analysis: any
  explanation: string
  ai_summary: string | null
  interview_recommendation: string
  skill_gaps?: SkillGap[]
  created_at: string
}

export interface SkillGap {
  skill_name: string
  is_required: boolean
  candidate_has: boolean
  category: string
}

export interface CandidateStatusInfo {
  ai_recommendation: string
  recruiter_decision: string | null
  override_reason: string | null
  notes: string | null
}

export interface RankedCandidate {
  rank: number
  application_id: string
  candidate_id: string
  candidate_name: string
  candidate_email: string
  overall_score: number
  skills_score: number
  experience_score: number
  education_score: number
  project_score: number
  certification_score: number
  ai_recommendation: string
  recruiter_decision: string | null
  status: string
  matched_skills: string[]
  missing_skills: string[]
}

export interface ScoreWeights {
  skills_weight: number
  experience_weight: number
  education_weight: number
  project_weight: number
  certification_weight: number
}

export interface DashboardKPIs {
  total_candidates: number
  total_jobs: number
  total_shortlisted: number
  total_rejected: number
  avg_match_score: number
  interviews_recommended: number
  active_jobs: number
  total_applications: number
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: any
  created_at: string
}

export interface InterviewQuestion {
  id: string
  category: 'technical' | 'project' | 'behavioral' | 'hr'
  question: string
  context: string | null
  difficulty: string
}

export interface WhatIfResult {
  original_score: number
  new_score: number
  score_change: number
  changed_components: any
  explanation: string
}

export interface ComparisonCandidate {
  application_id: string
  candidate: Candidate
  screening_result: ScreeningResult
}
