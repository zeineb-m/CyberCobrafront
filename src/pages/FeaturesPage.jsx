"use client"

import { useNavigate } from "react-router-dom"

export default function FeaturesPage() {
  const navigate = useNavigate()

  const features = [
    {
      category: "Zone Management",
      icon: "🗺️",
      items: [
        "Real-time zone status monitoring",
        "Geofencing and boundary alerts",
        "Multi-zone coordination",
        "Historical zone data",
      ],
    },
    {
      category: "Camera Network",
      icon: "📹",
      items: ["Live video feeds", "Motion detection", "Recording and playback", "Multi-camera synchronization"],
    },
    {
      category: "Equipment Management",
      icon: "🔧",
      items: ["Equipment inventory tracking", "Maintenance scheduling", "Performance monitoring", "Automated alerts"],
    },
    {
      category: "Analytics & Reports",
      icon: "📊",
      items: ["Custom report generation", "Data visualization", "Trend analysis", "Export capabilities"],
    },
    {
      category: "User Management",
      icon: "👥",
      items: ["Role-based access control", "User activity logging", "Permission management", "Audit trails"],
    },
    {
      category: "Security",
      icon: "🛡️",
      items: ["End-to-end encryption", "Two-factor authentication", "Security compliance", "Threat detection"],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-primary/80 backdrop-blur border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold">🐍</span>
            </div>
            <span className="font-bold text-lg">CyberCobra</span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-20 px-6 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Comprehensive Features</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Everything you need for enterprise-grade security monitoring and management
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-surface border border-border rounded-lg hover:border-accent transition-colors"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.category}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-text-secondary">
                      <span className="text-accent mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accent-light transition-colors"
          >
            Sign In Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-text-muted">
          <p>&copy; 2025 CyberCobra. Ministry of Interior. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
