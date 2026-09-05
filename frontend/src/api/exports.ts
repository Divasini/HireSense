import { apiClient } from './client'

export const exportCandidatesCSV = async (jobId: string): Promise<Blob> => {
  const res = await apiClient.get(`/export/candidates/csv/${jobId}`, { responseType: 'blob' })
  return res.data
}

export const exportCandidatesExcel = async (jobId: string): Promise<Blob> => {
  const res = await apiClient.get(`/export/candidates/excel/${jobId}`, { responseType: 'blob' })
  return res.data
}

export const exportScreeningPDF = async (applicationId: string): Promise<Blob> => {
  const res = await apiClient.get(`/export/screening/pdf/${applicationId}`, { responseType: 'blob' })
  return res.data
}
