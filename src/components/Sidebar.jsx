"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "operator", "public"] },
    { path: "/admin/zones", label: "Zones Sensibles", icon: "🗺️", roles: ["admin", "operator"] },
    { path: "/admin/objects", label: "Objets", icon: "📦", roles: ["admin", "operator"] },
    { path: "/admin/equipment", label: "Équipements", icon: "🔧", roles: ["admin", "operator"] },
    { path: "/admin/cameras", label: "Caméras", icon: "📹", roles: ["admin", "operator"] },
    { path: "/admin/reports", label: "Rapports", icon: "📈", roles: ["admin", "operator"] },
    { path: "/admin/users", label: "Utilisateurs", icon: "👥", roles: ["admin"] },
  ]

  const visibleItems = menuItems.filter((item) => user?.roles?.some((role) => item.roles.includes(role)))

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <span className="text-white font-bold text-lg">🐍</span>
          </div>
          <div>
            <h2 className="font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CyberCobra</h2>
            <p className="text-xs text-slate-400">Ministry Interior</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">CyberCobra v1.0</p>
      </div>
    </aside>
  )
}
