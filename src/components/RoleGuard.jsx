"use client"

import { useAuth } from "../context/AuthContext"

export default function RoleGuard({ children, requiredRole, requiredRoles, fallback = null }) {
  const { hasRole, hasAnyRole } = useAuth()

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return fallback
  }

  return children
}
