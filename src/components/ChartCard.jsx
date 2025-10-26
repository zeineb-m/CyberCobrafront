"use client"

export default function ChartCard({ title, subtitle }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="h-64 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
        <div className="text-center">
          <div className="text-5xl mb-3 opacity-50">📊</div>
          <p className="text-slate-400 font-medium">Chart visualization</p>
          <p className="text-xs text-slate-500 mt-2">Real-time data will be displayed here</p>
        </div>
      </div>
    </div>
  )
}
