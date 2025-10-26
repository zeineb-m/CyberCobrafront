"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import Modal from "../../components/Modal"

export default function ObjectsPage() {
  const { objects, zones, addObject, updateObject, deleteObject } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", zoneId: "", type: "structure", status: "operational" })

  const filteredObjects = objects.filter((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddObject = () => {
    if (formData.name && formData.zoneId) {
      if (editingId) {
        updateObject(editingId, formData)
        setEditingId(null)
      } else {
        addObject(formData)
      }
      setFormData({ name: "", zoneId: "", type: "structure", status: "operational" })
      setShowModal(false)
    }
  }

  const handleEdit = (obj) => {
    setFormData({ name: obj.name, zoneId: obj.zoneId, type: obj.type, status: obj.status })
    setEditingId(obj.id)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this object?")) {
      deleteObject(id)
    }
  }

  const handleOpenModal = () => {
    setFormData({ name: "", zoneId: "", type: "structure", status: "operational" })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Objects Inventory</h1>
            <p className="text-text-secondary">Manage critical infrastructure objects</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            + Add Object
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Objects Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Zone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((obj) => {
                const zone = zones.find((z) => z.id === obj.zoneId)
                return (
                  <tr key={obj.id} className="border-b border-border hover:bg-primary transition-colors">
                    <td className="px-6 py-3 text-sm text-text">{obj.name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{zone?.name || "Unknown"}</td>
                    <td className="px-6 py-3 text-sm text-text capitalize">{obj.type}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          obj.status === "operational"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {obj.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(obj)}
                          className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(obj.id)}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Object Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? "Edit Object" : "Add New Object"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Object Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="e.g., Server Rack A1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Zone</label>
              <select
                value={formData.zoneId}
                onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="">Select a zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="structure">Structure</option>
                <option value="gate">Gate</option>
                <option value="fence">Fence</option>
                <option value="vehicle">Vehicle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="operational">Operational</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddObject}
                className="flex-1 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
              >
                {editingId ? "Update Object" : "Add Object"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-primary border border-border text-text font-medium rounded-lg hover:border-accent transition-colors"
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
