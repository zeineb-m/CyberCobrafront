"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme")
    if (stored) {
      setIsDark(stored === "dark")
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (isDark) {
      root.classList.remove("light")
      root.classList.add("dark")
      document.body.style.backgroundColor = "#0a0f1e"
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
      document.body.style.backgroundColor = "#f8fafc"
    }
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark, mounted])

  const toggleTheme = () => setIsDark(!isDark)

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
