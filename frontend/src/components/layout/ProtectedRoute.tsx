import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { AppLayout } from './AppLayout'

interface ProtectedRouteProps {
  allowedRoles: Array<'recruiter' | 'candidate' | 'admin'>
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

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
