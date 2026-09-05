import { apiClient } from './client'
import { Candidate, Job, Application } from '../types'

// Candidate Self-Service APIs
export const getMyProfile = async () => {
  const res = await apiClient.get('/candidates/me/profile')
  return res.data
}

export const updateMyProfile = async (data: Record<string, any>) => {
  const res = await apiClient.put('/candidates/me/profile', data)
  return res.data
}

export const getMyDashboard = async () => {
  const res = await apiClient.get('/candidates/me/dashboard')
  return res.data
}

export const uploadMyResume = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post('/candidates/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const getMyResumes = async () => {
  const res = await apiClient.get('/candidates/me/resumes')
  return res.data
}

export const deleteMyResume = async (resumeId: string) => {
  const res = await apiClient.delete(`/candidates/me/resumes/${resumeId}`)
  return res.data
}

export const getMyRecommendations = async () => {
  const res = await apiClient.get('/candidates/me/recommendations')
  return res.data
}

export const applyForJob = async (jobId: string) => {
  const res = await apiClient.post(`/candidates/me/apply/${jobId}`)
  return res.data
}

export const getMyApplications = async () => {
  const res = await apiClient.get('/candidates/me/applications')
  return res.data
}

export const generateMyInterviewQuestions = async (
  jobId?: string,
  category?: string,
  difficulty?: string,
  count?: number,
  targetTitle?: string
) => {
  const res = await apiClient.post('/candidates/me/interview/generate', {
    job_id: jobId,
    target_title: targetTitle,
    category,
    difficulty,
    count
  })
  return res.data
}

export const evaluateMyInterviewAnswer = async (
  question: string,
  answer: string,
  category: string = 'technical',
  targetRole?: string
) => {
  const res = await apiClient.post('/candidates/me/interview/evaluate', {
    question,
    answer,
    category,
    target_role: targetRole
  })
  return res.data
}

export const getAdaptiveFollowUp = async (
  currentQuestion: any,
  candidateAnswer: string,
  evaluation: any,
  targetRole: string
) => {
  const res = await apiClient.post('/candidates/me/interview/adaptive-followup', {
    current_question: currentQuestion,
    candidate_answer: candidateAnswer,
    evaluation,
    target_role: targetRole
  })
  return res.data
}

export const saveInterviewSession = async (sessionData: {
  questions: any[]
  answers: any[]
  evaluations: any[]
  target_role: string
  company?: string
  interview_mode: string
  answer_mode: string
  difficulty: string
  duration_seconds: number
  job_id?: string
}) => {
  const res = await apiClient.post('/candidates/me/interview/sessions', sessionData)
  return res.data
}

export const getMyInterviewSessions = async () => {
  const res = await apiClient.get('/candidates/me/interview/sessions')
  return res.data
}

export const getInterviewSessionDetail = async (sessionId: string) => {
  const res = await apiClient.get(`/candidates/me/interview/sessions/${sessionId}`)
  return res.data
}

export const searchCandidateJobs = async (params: {
  title?: string
  location?: string
  work_mode?: string
  experience?: string
}) => {
  const res = await apiClient.get('/candidates/me/jobs/search', { params })
  return res.data
}

// Global / Recruiter Candidate APIs
export const getCandidates = async (params?: Record<string, any>) => {
  const res = await apiClient.get('/candidates', { params })
  return res.data
}

export const getCandidate = async (id: string): Promise<Candidate> => {
  const res = await apiClient.get(`/candidates/${id}`)
  return res.data
}

export const getCandidateSummary = async (candidateId: string, jobId: string): Promise<string> => {
  const res = await apiClient.get(`/candidates/${candidateId}/summary`, { params: { job_id: jobId } })
  return res.data
}

export const getRecommendedJobs = async (candidateId: string): Promise<Job[]> => {
  const res = await apiClient.get(`/candidates/${candidateId}/recommended-jobs`)
  return res.data
}

export const multiJobMatch = async (candidateId: string, jobIds: string[]) => {
  const res = await apiClient.post(`/candidates/${candidateId}/multi-match`, { job_ids: jobIds })
  return res.data
}

export const getDuplicates = async () => {
  const res = await apiClient.get('/candidates/duplicates')
  return res.data
}
