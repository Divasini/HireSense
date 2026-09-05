import { apiClient } from './client'
import { Job, RankedCandidate, ScoreWeights } from '../types'

export const getJobs = async (params?: Record<string, any>) => {
  const res = await apiClient.get('/jobs', { params })
  return res.data
}

export const getJob = async (id: string): Promise<Job> => {
  const res = await apiClient.get(`/jobs/${id}`)
  return res.data
}

export const createJob = async (data: Partial<Job>): Promise<Job> => {
  const res = await apiClient.post('/jobs', data)
  return res.data
}

export const updateJob = async (id: string, data: Partial<Job>): Promise<Job> => {
  const res = await apiClient.put(`/jobs/${id}`, data)
  return res.data
}

export const deleteJob = async (id: string) => {
  const res = await apiClient.delete(`/jobs/${id}`)
  return res.data
}

export const getJobCandidates = async (jobId: string): Promise<RankedCandidate[]> => {
  const res = await apiClient.get(`/jobs/${jobId}/candidates`)
  return res.data
}

export const updateScoreWeights = async (jobId: string, weights: ScoreWeights) => {
  const res = await apiClient.put(`/jobs/${jobId}/weights`, weights)
  return res.data
}

export const getScoreWeights = async (jobId: string): Promise<ScoreWeights> => {
  const res = await apiClient.get(`/jobs/${jobId}/weights`)
  return res.data
}
