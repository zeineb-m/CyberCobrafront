"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children, requiredRole, requiredRoles, requiredPermission, fallback }) {
  const { user, loading, hasRole, hasAnyRole, hasPermission } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-surface rounded-full border-t-accent animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  return children
}
