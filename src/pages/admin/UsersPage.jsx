"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import Modal from "../../components/Modal"

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([
    {
      id: "1",
      name: "Admin User",
      email: "admin@cybercobra.gov",
      role: "admin",
      status: "Active",
      lastLogin: "2 hours ago",
    },
    {
      id: "2",
      name: "Operator User",
      email: "operator@cybercobra.gov",
      role: "operator",
      status: "Active",
      lastLogin: "30 minutes ago",
    },
    {
      id: "3",
      name: "Public User",
      email: "user@cybercobra.gov",
      role: "public",
      status: "Active",
      lastLogin: "1 day ago",
    },
  ])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: "", email: "", role: "operator" })
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    if (formData.name && formData.email) {
      if (editingId) {
        setUsers(users.map((u) => (u.id === editingId ? { ...u, ...formData } : u)))
        setEditingId(null)
      } else {
        setUsers([...users, { id: `${Date.now()}`, ...formData, status: "Active", lastLogin: "Never" }])
      }
      setFormData({ name: "", email: "", role: "operator" })
      setShowModal(false)
    }
  }

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, role: user.role })
    setEditingId(user.id)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const handleOpenModal = () => {
    setFormData({ name: "", email: "", role: "operator" })
    setEditingId(null)
    setShowModal(true)
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "lastLogin", label: "Last Login" },
  ]

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                User Management
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Manage system users and permissions</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-900/20' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm text-slate-300">
                        {col.key === "role" ? (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-lg text-xs font-semibold capitalize border border-cyan-500/30">
                            {user[col.key]}
                          </span>
                        ) : col.key === "status" ? (
                          <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold border border-green-500/30 flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            {user[col.key]}
                          </span>
                        ) : (
                          user[col.key]
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-4 py-2 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser?.id}
                          className="px-4 py-2 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit User Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit User" : "Add New User"}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              >
                <option value="public">Public User</option>
                <option value="operator">Security Operator</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddUser}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
              >
                {editingId ? "💾 Update User" : "✨ Add User"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-slate-800/50 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
