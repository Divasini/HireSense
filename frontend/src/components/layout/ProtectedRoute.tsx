import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { AppLayout } from './AppLayout'

interface ProtectedRouteProps {
  allowedRoles: Array<'recruiter' | 'candidate' | 'admin'>
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isInitializing } = useAuthStore()

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-sage-muted font-mono tracking-wider uppercase">Verifying session...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access wrong route
    if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />
    if (user.role === 'candidate') return <Navigate to="/candidate" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/login" replace />
  }

  return (
    <AppLayout />
  )
}
