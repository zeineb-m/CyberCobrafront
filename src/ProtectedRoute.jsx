

import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (!user || !user.is_staff)) {
      navigate("/login")
    }
  }, [user, loading, navigate])

  if (loading || !user?.is_staff) return null

  return children
}
