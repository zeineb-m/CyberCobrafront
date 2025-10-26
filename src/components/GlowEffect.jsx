"use client"

export default function GlowEffect({ children, intensity = "medium" }) {
  const intensityMap = {
    low: "shadow-lg shadow-accent/20",
    medium: "shadow-2xl shadow-accent/40",
    high: "shadow-2xl shadow-accent/60",
  }

  return (
    <div className={`relative ${intensityMap[intensity]}`}>
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 rounded-lg pointer-events-none" />
    </div>
  )
}
