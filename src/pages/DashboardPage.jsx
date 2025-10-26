"use client"

import { useAuth } from "../context/AuthContext"
import { useData } from "../context/DataContext"
import StatCard from "../components/StatCard"
import ChartCard from "../components/ChartCard"

export default function DashboardPage() {
  const { user } = useAuth()
  const { zones, equipment, cameras, reports } = useData()

  const stats = [
    { 
      title: "Active Zones", 
      value: zones.filter((z) => z.status === "active").length, 
      status: "success", 
      icon: "🗺️",
      change: "+12%"
    },
    {
      title: "Cameras Online",
      value: cameras.filter((c) => c.status === "recording").length,
      status: "success",
      icon: "📹",
      change: "+5%"
    },
    {
      title: "Equipment Status",
      value: `${Math.round((equipment.filter((e) => e.status === "online").length / equipment.length) * 100)}%`,
      status: "success",
      icon: "🔧",
      change: "+8%"
    },
    {
      title: "Pending Reports",
      value: reports.filter((r) => r.status === "pending").length,
      status: "warning",
      icon: "📋",
      change: "-3%"
    },
  ]

  const recentActivity = [
    { 
      time: "2 hours ago", 
      event: "Zone A perimeter check completed", 
      type: "zone",
      status: "success"
    },
    { 
      time: "4 hours ago", 
      event: "Equipment maintenance scheduled", 
      type: "equipment",
      status: "info"
    },
    { 
      time: "6 hours ago", 
      event: `New camera added to network (${cameras.length} total)`, 
      type: "camera",
      status: "success"
    },
    { 
      time: "1 day ago", 
      event: `Security report generated (${reports.length} total)`, 
      type: "report",
      status: "info"
    },
  ]

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Welcome back, </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {user?.name}
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Here's your security overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Zone Activity" subtitle="Last 30 days" />
          <ChartCard title="System Performance" subtitle="Real-time monitoring" />
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-400' : 'bg-blue-400'
                  }`}></div>
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    {item.event}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
