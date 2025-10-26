"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import Modal from "../../components/Modal"

export default function ZonesPage() {
  const { zones, addZone, updateZone, deleteZone } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", description: "", status: "active" })

  const filteredZones = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddZone = () => {
    if (formData.name) {
      if (editingId) {
        updateZone(editingId, formData)
        setEditingId(null)
      } else {
        addZone(formData)
      }
      setFormData({ name: "", description: "", status: "active" })
      setShowModal(false)
    }
  }

  const handleEdit = (zone) => {
    setFormData({ name: zone.name, description: zone.description, status: zone.status })
    setEditingId(zone.id)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this zone?")) {
      deleteZone(id)
    }
  }

  const handleOpenModal = () => {
    setFormData({ name: "", description: "", status: "active" })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Zones Sensibles
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Monitor and manage sensitive zones</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Zone
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        {/* Zones Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {zone.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{zone.description}</p>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                    zone.status === "active" 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${zone.status === "active" ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></span>
                  {zone.status}
                </span>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleEdit(zone)}
                  className="flex-1 px-4 py-2.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30 font-medium"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(zone.id)}
                  className="flex-1 px-4 py-2.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 font-medium"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Zone Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Zone" : "Add New Zone"}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Zone Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="e.g., Zone A - North Wing"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                placeholder="Detailed zone description"
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddZone}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
              >
                {editingId ? "💾 Update Zone" : "✨ Add Zone"}
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
