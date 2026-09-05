import { apiClient } from './client'
import { DashboardKPIs } from '../types'

export const getDashboardKPIs = async (): Promise<DashboardKPIs> => {
  const res = await apiClient.get('/analytics/kpis')
  return res.data
}

export const getScoreDistribution = async (jobId?: string) => {
  const res = await apiClient.get('/analytics/score-distribution', { params: { job_id: jobId } })
  return res.data
}

export const getSkillDemand = async () => {
  const res = await apiClient.get('/analytics/skill-demand')
  return res.data
}

export const getRecruitmentFunnel = async (jobId?: string) => {
  const res = await apiClient.get('/analytics/funnel', { params: { job_id: jobId } })
  return res.data
}

export const getJobMetrics = async () => {
  const res = await apiClient.get('/analytics/job-metrics')
  return res.data
}
