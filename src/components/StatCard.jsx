"use client"

export default function StatCard({ title, value, status = "neutral", icon = "📊", change }) {
  const statusColors = {
    success: "from-green-500/20 to-emerald-500/20 border-green-500/50",
    warning: "from-yellow-500/20 to-amber-500/20 border-yellow-500/50",
    error: "from-red-500/20 to-rose-500/20 border-red-500/50",
    neutral: "from-slate-800/50 to-slate-700/50 border-slate-700",
  }

  const iconColors = {
    success: "from-green-400 to-emerald-400",
    warning: "from-yellow-400 to-amber-400",
    error: "from-red-400 to-rose-400",
    neutral: "from-cyan-400 to-blue-400",
  }

  return (
    <div className={`bg-gradient-to-br ${statusColors[status]} backdrop-blur-xl p-6 rounded-2xl border transition-all hover:scale-105 hover:shadow-xl hover:shadow-${status === 'success' ? 'green' : status === 'warning' ? 'yellow' : 'cyan'}-500/20 group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold text-white mb-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${
              change.startsWith('+') ? 'text-green-400' : 'text-red-400'
            }`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`text-4xl bg-gradient-to-br ${iconColors[status]} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
