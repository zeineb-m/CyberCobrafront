"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import Modal from "../../components/Modal"

const BACKEND_URL = "https://cybercobra-4.onrender.com" // ✅ Backend Render

export default function UsersPage() {
const { user: currentUser, token } = useAuth()
const [users, setUsers] = useState([])
const [showModal, setShowModal] = useState(false)
const [editingId, setEditingId] = useState(null)
const [formData, setFormData] = useState({
username: "",
email: "",
first_name: "",
last_name: "",
CIN: "",
phone: "",
image: null,
password: "",
is_staff: true,
is_active: true,
})
const [loadingForm, setLoadingForm] = useState(false)
const [error, setError] = useState("")
const [searchTerm, setSearchTerm] = useState("")

// Vérification superuser
useEffect(() => {
if (!currentUser?.is_superuser) {
alert("Unauthorized! Only superusers can manage users.")
}
}, [currentUser])

// Charger les utilisateurs
useEffect(() => {
if (!token) return
fetchUsers()
}, [token])

const fetchUsers = async () => {
try {
const res = await fetch(${BACKEND_URL}/api/auth/users/, {
headers: { Authorization: Bearer ${token} },
})
const data = await res.json()
if (res.ok) setUsers(data)
else console.error(data)
} catch (err) {
console.error("Failed to fetch users", err)
}
}

const handleChange = (e) => {
const { name, value, files, type, checked } = e.target
if (type === "file") setFormData(prev => ({ ...prev, [name]: files[0] }))
else if (type === "checkbox") setFormData(prev => ({ ...prev, [name]: checked }))
else setFormData(prev => ({ ...prev, [name]: value }))
}

const handleSaveUser = async () => {
if (!formData.username || !formData.email || (!editingId && !formData.password)) {
setError("Please fill all required fields")
return
}

setLoadingForm(true)
setError("")
try {
  const dataToSend = new FormData()
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && (key !== "password" || value !== "")) {
      dataToSend.append(key, value)
    }
  })

  const url = editingId
    ? `${BACKEND_URL}/api/auth/users/${editingId}/`
    : `${BACKEND_URL}/api/auth/register/`

  const method = editingId ? "PUT" : "POST"

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: dataToSend,
  })

  const data = await res.json()
  if (res.ok) {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      CIN: "",
      phone: "",
      image: null,
      password: "",
      is_staff: true,
      is_active: true,
    })
    await fetchUsers()
  } else setError(data.message || JSON.stringify(data))
} catch (err) {
  console.error(err)
  setError("Server not reachable")
} finally {
  setLoadingForm(false)
}

}

const handleEdit = (user) => {
setFormData({
username: user.username,
email: user.email,
first_name: user.first_name,
last_name: user.last_name,
CIN: user.CIN,
phone: user.phone,
image: null,
password: "",
is_staff: user.is_staff,
is_active: user.is_active,
})
setEditingId(user.id)
setShowModal(true)
}

const handleDelete = async (id) => {
if (!confirm("Are you sure you want to delete this user?")) return
try {
const res = await fetch(${BACKEND_URL}/api/auth/users/${id}/, {
method: "DELETE",
headers: { Authorization: Bearer ${token} },
})
if (res.ok) await fetchUsers()
else console.error(await res.json())
} catch (err) {
console.error(err)
}
}

const filteredUsers = users.filter(
u =>
!searchTerm ||
(u.username ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
(u.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
)

return (




User Management
Manage system users and permissions

<button
onClick={() => {
setEditingId(null)
setFormData({
username: "",
email: "",
first_name: "",
last_name: "",
CIN: "",
phone: "",
image: null,
password: "",
is_staff: true,
is_active: true,
})
setShowModal(true)
}}
className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover transition-all flex items-center gap-2"
>
+ Add User




    <input
      type="text"
      placeholder="🔍 Search users by name or email..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="w-full px-5 py-3 mb-6 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
    />

    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <table className="w-full text-left">
        <thead className="bg-slate-800/60 border-b border-slate-700">
          <tr>
            <th className="px-6 py-4 text-sm text-slate-300">Username</th>
            <th className="px-6 py-4 text-sm text-slate-300">Email</th>
            <th className="px-6 py-4 text-sm text-slate-300">Staff</th>
            <th className="px-6 py-4 text-sm text-slate-300">Active</th>
            <th className="px-6 py-4 text-sm text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4 text-sm text-white">{user.username}</td>
              <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_staff ? "bg-green-600/20 text-green-400" : "bg-slate-600/20 text-slate-400"}`}>
                  {user.is_staff ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}`}>
                  {user.is_active ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4 flex gap-2">
                <button onClick={() => handleEdit(user)} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(user.id)} disabled={user.id === currentUser?.id} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit User" : "Add New User"}>
      <div className="space-y-4">
        {error && <p className="text-red-400">{error}</p>}

        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>
        <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>
        <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>
        <input type="text" name="CIN" placeholder="CIN" value={formData.CIN} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>
        <input type="file" name="image" onChange={handleChange} className="w-full text-white"/>
        <input type="password" name="password" placeholder={editingId ? "Change password (optional)" : "Password"} value={formData.password} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700"/>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_staff" checked={formData.is_staff} onChange={handleChange} className="accent-cyan-500"/>
          Is Staff
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="accent-green-500"/>
          Is Active
        </label>

        <div className="flex gap-3 pt-4">
          <button onClick={handleSaveUser} disabled={loadingForm} className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            {loadingForm ? "Saving..." : editingId ? "💾 Update User" : "✨ Add User"}
          </button>
          <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  </div>
</div>
