import { create } from 'zustand'
import { User } from '../types'
import { login as loginApi, register as registerApi, getMe } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string, role: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<User | null>
  setUser: (user: User | null) => void
  initialize: () => Promise<void>
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: initialToken,
  isAuthenticated: false,
  isInitializing: Boolean(initialToken),
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

  login: async (email, password) => {
    const data = await loginApi(email, password)
    if (!data || typeof data !== 'object' || !data.access_token) {
      throw new Error('Authentication failed: Invalid credentials or server response')
    }
    localStorage.setItem('token', data.access_token)
    set({ token: data.access_token })
    await get().loadUser()
  },

  register: async (email, password, full_name, role) => {
    await registerApi(email, password, full_name, role)
    await get().login(email, password)
  },

  logout: () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  },

  loadUser: async () => {
    try {
      const user = await getMe()
      if (!user || !user.id || !user.role) {
        throw new Error('Failed to parse user profile')
      }
      set({ user, isAuthenticated: true })
      return user
    } catch (error) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false })
      throw error
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      set({ token, isInitializing: true })
      try {
        await get().loadUser()
      } catch (error) {
        console.warn('Session verification failed on initialize:', error)
      } finally {
        set({ isInitializing: false })
      }
    } else {
      set({ isInitializing: false })
    }
  }
}))
