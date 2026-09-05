import { apiClient } from './client'
import { User, AuditLog } from '../types'

export const getSystemStats = async () => {
  const res = await apiClient.get('/admin/stats')
  return res.data
}

export const getAuditLogs = async (params?: Record<string, any>): Promise<AuditLog[]> => {
  const res = await apiClient.get('/admin/audit-logs', { params })
  return res.data
}

export const getUsers = async (params?: Record<string, any>): Promise<User[]> => {
  const res = await apiClient.get('/admin/users', { params })
  return res.data
}

export const updateUserRole = async (id: string, role: string) => {
  const res = await apiClient.put(`/admin/users/${id}/role`, { role })
  return res.data
}

export const deleteUser = async (id: string) => {
  const res = await apiClient.delete(`/admin/users/${id}`)
  return res.data
}
