"use client"

import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { LanguageSwitcher } from "./LanguageSwitcher"

export default function Header() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="bg-slate-900/90 backdrop-blur-lg border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <span className="text-white font-bold text-lg">CC</span>
        </div>
        <h1 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          CyberCobra Platform
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        
        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-slate-800 rounded-lg transition-all duration-200 hover:scale-110 text-2xl"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.roles?.join(", ")}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
