import { apiClient } from './client'
import { Notification } from '../types'

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await apiClient.get('/notifications')
  return res.data
}

export const markAsRead = async (id: string) => {
  const res = await apiClient.put(`/notifications/${id}/read`)
  return res.data
}

export const markAllAsRead = async () => {
  const res = await apiClient.put('/notifications/read-all')
  return res.data
}
