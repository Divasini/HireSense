import { apiClient } from './client'
import { User } from '../types'

export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password })
  return response.data
}

export const register = async (email: string, password: string, full_name: string, role: string) => {
  const response = await apiClient.post('/auth/register', { email, password, full_name, role })
  return response.data
}

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me')
  return response.data
}
