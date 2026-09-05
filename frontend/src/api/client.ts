import axios from 'axios'

// Dynamic baseURL determination:
// 1. If VITE_API_URL is provided in environment variables (e.g. on Render), normalize and use it.
// 2. If in production and VITE_API_URL is not set, fallback to the deployed Render backend URL.
// 3. In local development, default to '/api' so Vite proxy forwards requests to http://localhost:8000.
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL?.trim()
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`
  }
  if (import.meta.env.PROD) {
    return 'https://hiresense-backend-vm5s.onrender.com/api'
  }
  return '/api'
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      // Avoid redirect loop or reload when user is already on auth pages
      if (typeof window !== 'undefined' && !['/login', '/register', '/'].includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
