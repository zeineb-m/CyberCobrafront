import { useState, useRef, useEffect } from "react"
import { useLanguage } from "../context/LanguageContext"

const flags = {
  en: (
    <svg viewBox="0 0 24 16" className="w-5 h-4">
      <rect fill="#012169" width="24" height="16"/>
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2"/>
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="2"/>
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.3"/>
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.2"/>
    </svg>
  ),
  ar: (
    <svg viewBox="0 0 24 16" className="w-5 h-4">
      <rect fill="#239E46" width="24" height="16"/>
      <rect fill="#FFFFFF" x="6" width="18" height="16"/>
      <rect fill="#CE1126" x="12" width="12" height="16"/>
      <g transform="translate(4, 8)">
        <path d="M0-3.5 A3.5 3.5 0 1 1 0 3.5 A2.8 2.8 0 1 0 0-2.8z" fill="#CE1126"/>
        <path d="M0-1.5l.5 1.5h1.6L.9.6l.5 1.5L0 1.2-1.4 2.1l.5-1.5L-2.1 0h1.6z" fill="#CE1126"/>
      </g>
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 24 16" className="w-5 h-4">
      <rect fill="#ED2939" width="24" height="16"/>
      <rect fill="#002395" width="8" height="16"/>
      <rect fill="#FFFFFF" x="8" width="8" height="16"/>
    </svg>
  ),
}

const languageNames = {
  en: "English",
  ar: "العربية",
  fr: "Français",
}

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageChange = (lang) => {
    changeLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-300 hover:border-cyan-500/30"
        aria-label="Change language"
      >
        {flags[language]}
        <span className="text-sm font-medium text-slate-200">{languageNames[language]}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {Object.keys(flags).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                language === lang ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-l-2 border-cyan-500" : ""
              }`}
            >
              {flags[lang]}
              <span className={`text-sm font-medium ${language === lang ? "text-cyan-400" : "text-slate-200"}`}>
                {languageNames[lang]}
              </span>
              {language === lang && (
                <svg className="w-4 h-4 ml-auto text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
