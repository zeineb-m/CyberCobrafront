"use client"

import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { LanguageSwitcher } from "../components/LanguageSwitcher"
import { useEffect } from "react"

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-lg border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <span className="text-white font-bold text-xl">🐍</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CyberCobra</span>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <button
              onClick={() => navigate("/features")}
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              {t("features")}
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              {t("pricing")}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-slate-300 hover:text-white transition-colors font-medium"
            >
              {t("signIn")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              {t("getStarted")}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Modern Gradient */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-300">{t("trustedBy")}</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              {t("heroTitle")}
            </span>
            <br />
            <span className="text-white">{t("heroSubtitle")}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t("heroDescription")}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              {t("startFreeTrial")}
            </button>
            <button
              onClick={() => navigate("/features")}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all"
            >
              {t("viewDemo")}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { number: "99.9%", label: t("uptime") },
              { number: "1M+", label: t("eventsDay") },
              { number: "24/7", label: t("support") },
              { number: "50+", label: t("agencies") },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {t("enterpriseSecurity")}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t("comprehensiveTools")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: "🗺️", 
                title: t("zoneManagement"), 
                desc: t("zoneDesc"),
                gradient: "from-cyan-500 to-blue-500"
              },
              { 
                icon: "📹", 
                title: t("cameraNetwork"), 
                desc: t("cameraDesc"),
                gradient: "from-blue-500 to-purple-500"
              },
              { 
                icon: "📊", 
                title: t("advancedAnalytics"), 
                desc: t("analyticsDesc"),
                gradient: "from-purple-500 to-pink-500"
              },
              { 
                icon: "🔧", 
                title: t("equipmentTracking"), 
                desc: t("equipmentDesc"),
                gradient: "from-pink-500 to-red-500"
              },
              { 
                icon: "👥", 
                title: t("userManagement"), 
                desc: t("userDesc"),
                gradient: "from-red-500 to-orange-500"
              },
              { 
                icon: "🛡️", 
                title: t("securityFirst"), 
                desc: t("securityDesc"),
                gradient: "from-orange-500 to-cyan-500"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-2"
              >
                <div className={`text-5xl mb-6 inline-block p-4 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            {t("readyToSecure")} <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{t("secureText")}</span> {t("yourInfrastructure")}
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto">
            {t("joinAgencies")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              {t("startFreeTrial")}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 bg-slate-800/50 backdrop-blur-sm text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all"
            >
              {t("signIn")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="text-white font-bold text-xl">🐍</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CyberCobra</span>
            </div>
            <p className="text-slate-400 text-center">
              &copy; 2025 CyberCobra. {t("allRights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
