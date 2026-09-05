import { apiClient } from './client'
import { ScreeningResult, SkillGap, RankedCandidate, WhatIfResult, ComparisonCandidate, InterviewQuestion } from '../types'

export const analyzeCandidate = async (applicationId: string): Promise<ScreeningResult> => {
  const res = await apiClient.post(`/screening/analyze/${applicationId}`)
  return res.data
}

export const analyzeJobCandidates = async (jobId: string) => {
  const res = await apiClient.post(`/screening/analyze-job/${jobId}`)
  return res.data
}

export const getScreeningResult = async (applicationId: string): Promise<ScreeningResult> => {
  const res = await apiClient.get(`/screening/result/${applicationId}`)
  return res.data
}

export const getSkillGap = async (applicationId: string): Promise<SkillGap[]> => {
  const res = await apiClient.get(`/screening/skill-gap/${applicationId}`)
  return res.data
}

export const getRanking = async (jobId: string): Promise<RankedCandidate[]> => {
  const res = await apiClient.get(`/screening/ranking/${jobId}`)
  return res.data
}

export const compareCandidates = async (applicationIds: string[]): Promise<ComparisonCandidate[]> => {
  const res = await apiClient.post('/screening/compare', { application_ids: applicationIds })
  return res.data
}

export const whatIfSimulation = async (data: any): Promise<WhatIfResult> => {
  const res = await apiClient.post('/screening/what-if', data)
  return res.data
}

export const shortlistCandidate = async (applicationId: string, decision: string, reason?: string) => {
  const res = await apiClient.post(`/screening/shortlist/${applicationId}`, { decision, reason })
  return res.data
}

export const batchShortlist = async (jobId: string, threshold: number) => {
  const res = await apiClient.post(`/screening/batch-shortlist/${jobId}`, { threshold })
  return res.data
}

export const generateInterviewQuestions = async (applicationId: string): Promise<InterviewQuestion[]> => {
  const res = await apiClient.post(`/screening/interview-questions/${applicationId}`)
  return res.data
}

export const getInterviewQuestions = async (applicationId: string): Promise<InterviewQuestion[]> => {
  const res = await apiClient.get(`/screening/interview-questions/${applicationId}`)
  return res.data
}
