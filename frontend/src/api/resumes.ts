import { apiClient } from './client'
import { Resume } from '../types'

export const uploadResumes = async (files: File[], jobId?: string) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  if (jobId) {
    formData.append('job_id', jobId)
  }

  const res = await apiClient.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const processResume = async (id: string): Promise<Resume> => {
  const res = await apiClient.post(`/resumes/${id}/process`)
  return res.data
}

export const getResumeParsed = async (id: string) => {
  const res = await apiClient.get(`/resumes/${id}/parsed`)
  return res.data
}

export const getResumeQuality = async (id: string) => {
  const res = await apiClient.get(`/resumes/${id}/quality`)
  return res.data
}

export const getATSScore = async (id: string) => {
  const res = await apiClient.get(`/resumes/${id}/ats-score`)
  return res.data
}

export const getImprovements = async (id: string) => {
  const res = await apiClient.get(`/resumes/${id}/improvements`)
  return res.data
}
