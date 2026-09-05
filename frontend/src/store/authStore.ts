import { create } from 'zustand'
import { User } from '../types'
import { login as loginApi, register as registerApi, getMe } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string, role: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  setUser: (user: User | null) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const data = await loginApi(email, password)
    localStorage.setItem('token', data.access_token)
    set({ token: data.access_token })
    await get().loadUser()
  },

  register: async (email, password, full_name, role) => {
    await registerApi(email, password, full_name, role)
    await get().login(email, password)
  },

  logout: () => {
    localStorage.clear()
    sessionStorage.clear()
    set({ user: null, token: null, isAuthenticated: false })
    window.location.href = '/login'
  },

  loadUser: async () => {
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true })
    } catch (error) {
      get().logout()
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      set({ token })
      await get().loadUser()
    }
  }
}))
