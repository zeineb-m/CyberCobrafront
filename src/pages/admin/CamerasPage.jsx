"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import Modal from "../../components/Modal"

export default function CamerasPage() {
  const { cameras, zones, addCamera, updateCamera, deleteCamera } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", zoneId: "", resolution: "1080p", status: "recording", ip: "" })

  const filteredCameras = cameras.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddCamera = () => {
    if (formData.name && formData.zoneId && formData.ip) {
      if (editingId) {
        updateCamera(editingId, formData)
        setEditingId(null)
      } else {
        addCamera(formData)
      }
      setFormData({ name: "", zoneId: "", resolution: "1080p", status: "recording", ip: "" })
      setShowModal(false)
    }
  }

  const handleEdit = (camera) => {
    setFormData({
      name: camera.name,
      zoneId: camera.zoneId,
      resolution: camera.resolution,
      status: camera.status,
      ip: camera.ip,
    })
    setEditingId(camera.id)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this camera?")) {
      deleteCamera(id)
    }
  }

  const handleOpenModal = () => {
    setFormData({ name: "", zoneId: "", resolution: "1080p", status: "recording", ip: "" })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Camera Network</h1>
            <p className="text-text-secondary">Monitor and manage surveillance cameras</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            + Add Camera
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search cameras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Cameras Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Zone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">IP Address</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Resolution</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCameras.map((camera) => {
                const zone = zones.find((z) => z.id === camera.zoneId)
                return (
                  <tr key={camera.id} className="border-b border-border hover:bg-primary transition-colors">
                    <td className="px-6 py-3 text-sm text-text">{camera.name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{zone?.name || "Unknown"}</td>
                    <td className="px-6 py-3 text-sm text-text font-mono">{camera.ip}</td>
                    <td className="px-6 py-3 text-sm text-text">{camera.resolution}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        {camera.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(camera)}
                          className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(camera.id)}
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

        {/* Add/Edit Camera Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? "Edit Camera" : "Add New Camera"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Camera Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="e.g., Front Gate Camera"
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
              <label className="block text-sm font-medium text-text-secondary mb-2">IP Address</label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="192.168.1.10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Resolution</label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddCamera}
                className="flex-1 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
              >
                {editingId ? "Update Camera" : "Add Camera"}
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
