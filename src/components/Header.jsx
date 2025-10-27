"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
    setOpenMenu(false);
  };

  // Fermer le menu si on clique à l’extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* 🔽 Menu utilisateur */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpenMenu((prev) => !prev)}
            className="flex items-center gap-3 pl-4 border-l border-slate-700"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-white cursor-pointer hover:text-cyan-400 transition">
                {user?.name || user?.username}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.roles?.join(", ") || "User"}
              </p>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openMenu ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {openMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 animate-fade-in">
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
