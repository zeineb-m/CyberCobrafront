"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@cybercobra.gov")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      // Error is handled by context
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: "admin@cybercobra.gov", password: "admin123", role: "Admin", desc: "Full system access" },
    { email: "operator@cybercobra.gov", password: "operator123", role: "Operator", desc: "Zone & equipment management" },
    { email: "user@cybercobra.gov", password: "user123", role: "Public", desc: "View-only access" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50 mb-4">
              <span className="text-white font-bold text-3xl">🐍</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-400 mt-2">Sign in to CyberCobra Platform</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="your@email.gov"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-400">Demo Accounts</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-3 mb-6">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email)
                  setPassword(account.password)
                }}
                className="w-full text-left p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {account.role}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">{account.desc}</div>
                  </div>
                  <div className="text-slate-500 group-hover:text-cyan-500 transition-colors">→</div>
                </div>
              </button>
            ))}
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          🔒 Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  )
}
