"use client"

import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import axios from "axios"

export default function ProfilePage() {
  const { user, setUser, token } = useAuth()
  const [profile, setProfile] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("[Profile] Fetching profile data...")
        const res = await axios.get("http://127.0.0.1:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("[Profile] Data received:", res.data)
        setProfile(res.data)
      } catch (err) {
        console.error("[Profile] Error fetching profile:", err.response || err)
        setError("Failed to load profile information.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [token])

  if (loading) {
    return (
      <div className="text-center mt-20 text-slate-300">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-400">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-slate-800 p-6 rounded-2xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4 text-cyan-400 text-center">
        My Profile
      </h1>

      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            readOnly
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-gray-300 focus:outline-none cursor-not-allowed"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={profile.first_name}
              readOnly
              className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-gray-300 focus:outline-none cursor-not-allowed"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={profile.last_name}
              readOnly
              className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-gray-300 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            readOnly
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-gray-300 focus:outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            readOnly
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600 text-gray-300 focus:outline-none cursor-not-allowed"
          />
        </div>
      </form>

   
    </div>
  )
}
