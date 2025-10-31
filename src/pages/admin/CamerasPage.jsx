"use client"

import { useState, useEffect } from "react"
import Modal from "../../components/Modal"
import FireDetectionModal from "../../components/FireDetectionModal"

const API_URL = 'http://localhost:8000/api'

function getAuthHeaders() {
  const token = sessionStorage.getItem('access') || localStorage.getItem('access')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", zone: "", resolution: "1080p", status: "RECORDING", ip_address: "" })
  const [showFireDetection, setShowFireDetection] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)

  useEffect(() => {
    fetchCameras()
  }, [])

  async function fetchCameras() {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/cameras/`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setCameras(data)
      }
    } catch (error) {
      console.error('Failed to fetch cameras:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCameras = cameras.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  async function handleAddCamera() {
    if (!formData.name || !formData.zone || !formData.ip_address) {
      alert('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        // Update
        const response = await fetch(`${API_URL}/cameras/${editingId}/`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          await fetchCameras()
          setEditingId(null)
        }
      } else {
        // Create
        const response = await fetch(`${API_URL}/cameras/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        })
        if (response.ok) {
          await fetchCameras()
        }
      }
      setFormData({ name: "", zone: "", resolution: "1080p", status: "RECORDING", ip_address: "" })
      setShowModal(false)
    } catch (error) {
      console.error('Failed to save camera:', error)
      alert('Failed to save camera')
    }
  }

  function handleEdit(camera) {
    setFormData({
      name: camera.name,
      zone: camera.zone,
      resolution: camera.resolution,
      status: camera.status,
      ip_address: camera.ip_address,
    })
    setEditingId(camera.id_camera)
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this camera?")) return

    try {
      const response = await fetch(`${API_URL}/cameras/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (response.ok) {
        await fetchCameras()
      }
    } catch (error) {
      console.error('Failed to delete camera:', error)
      alert('Failed to delete camera')
    }
  }

  function handleOpenModal() {
    setFormData({ name: "", zone: "", resolution: "1080p", status: "RECORDING", ip_address: "" })
    setEditingId(null)
    setShowModal(true)
  }

  function handleOpenFireDetection(camera) {
    setSelectedCamera(camera)
    setShowFireDetection(true)
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-text-secondary">Loading cameras...</td>
                </tr>
              ) : filteredCameras.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-text-secondary">No cameras found</td>
                </tr>
              ) : (
                filteredCameras.map((camera) => {
                  const getStatusColor = (status) => {
                    if (status === 'RECORDING') return 'bg-green-500/20 text-green-400'
                    if (status === 'OFFLINE') return 'bg-red-500/20 text-red-400'
                    return 'bg-yellow-500/20 text-yellow-400'
                  }
                  
                  return (
                    <tr key={camera.id_camera} className="border-b border-border hover:bg-primary transition-colors">
                      <td className="px-6 py-3 text-sm text-text font-medium">{camera.name}</td>
                      <td className="px-6 py-3 text-sm text-text-secondary">{camera.zone}</td>
                      <td className="px-6 py-3 text-sm text-text font-mono">{camera.ip_address}</td>
                      <td className="px-6 py-3 text-sm text-text">{camera.resolution}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
                          {camera.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenFireDetection(camera)}
                            className="px-3 py-1 text-xs bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors font-medium"
                            title="AI Fire Detection"
                          >
                            🔥 Detect
                          </button>
                          <button
                            onClick={() => handleEdit(camera)}
                            className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(camera.id_camera)}
                            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Fire Detection Modal */}
        {selectedCamera && (
          <FireDetectionModal
            isOpen={showFireDetection}
            onClose={() => setShowFireDetection(false)}
            cameraName={selectedCamera.name}
          />
        )}

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
                placeholder="e.g., Front Gate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Zone</label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="e.g., Zone A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">IP Address</label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
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
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="RECORDING">Recording</option>
                <option value="OFFLINE">Offline</option>
                <option value="MAINTENANCE">Maintenance</option>
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
