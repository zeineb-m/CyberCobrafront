"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const AuthContext = createContext()

// Mock JWT token generator
const generateMockToken = (user) => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

// Mock users database
const MOCK_USERS = [
  { id: "1", email: "admin@cybercobra.gov", password: "admin123", name: "Admin User", roles: ["admin", "operator"] },
  { id: "2", email: "operator@cybercobra.gov", password: "operator123", name: "Operator User", roles: ["operator"] },
  { id: "3", email: "user@cybercobra.gov", password: "user123", name: "Public User", roles: ["public"] },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const storedToken = sessionStorage.getItem("auth_token")
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken))
        if (payload.exp > Math.floor(Date.now() / 1000)) {
          setToken(storedToken)
          setUser({
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            roles: payload.roles,
          })
        } else {
          sessionStorage.removeItem("auth_token")
        }
      } catch (e) {
        sessionStorage.removeItem("auth_token")
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const mockUser = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (!mockUser) {
        throw new Error("Invalid email or password")
      }

      const userData = { id: mockUser.id, name: mockUser.name, email: mockUser.email, roles: mockUser.roles }
      const newToken = generateMockToken(userData)

      setUser(userData)
      setToken(newToken)
      sessionStorage.setItem("auth_token", newToken)

      return userData
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setError(null)
    sessionStorage.removeItem("auth_token")
  }, [])

  const hasRole = useCallback((role) => user?.roles?.includes(role) || false, [user])

  const hasAnyRole = useCallback(
    (roles) => {
      if (!Array.isArray(roles)) return false
      return roles.some((role) => user?.roles?.includes(role))
    },
    [user],
  )

  const hasAllRoles = useCallback(
    (roles) => {
      if (!Array.isArray(roles)) return false
      return roles.every((role) => user?.roles?.includes(role))
    },
    [user],
  )

  const getPermissions = useCallback(() => {
    if (!user) return []
    const permissions = []
    if (user.roles.includes("admin")) {
      permissions.push("manage_users", "manage_system", "view_reports", "manage_zones", "manage_equipment")
    }
    if (user.roles.includes("operator")) {
      permissions.push("manage_zones", "manage_equipment", "view_reports", "manage_cameras")
    }
    if (user.roles.includes("public")) {
      permissions.push("view_public_data")
    }
    return permissions
  }, [user])

  const hasPermission = useCallback(
    (permission) => {
      return getPermissions().includes(permission)
    },
    [getPermissions],
  )

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getPermissions,
    hasPermission,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
