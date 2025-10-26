"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import Modal from "../../components/Modal"

export default function EquipmentPage() {
  const { equipment, objects, addEquipment, updateEquipment, deleteEquipment } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: "", objectId: "", type: "camera", status: "online" })

  const filteredEquipment = equipment.filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddEquipment = () => {
    if (formData.name && formData.objectId) {
      if (editingId) {
        updateEquipment(editingId, formData)
        setEditingId(null)
      } else {
        addEquipment(formData)
      }
      setFormData({ name: "", objectId: "", type: "camera", status: "online" })
      setShowModal(false)
    }
  }

  const handleEdit = (equip) => {
    setFormData({ name: equip.name, objectId: equip.objectId, type: equip.type, status: equip.status })
    setEditingId(equip.id)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      deleteEquipment(id)
    }
  }

  const handleOpenModal = () => {
    setFormData({ name: "", objectId: "", type: "camera", status: "online" })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Security Equipment</h1>
            <p className="text-text-secondary">Track equipment status and maintenance</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            + Add Equipment
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Equipment Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Object</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((equip) => {
                const obj = objects.find((o) => o.id === equip.objectId)
                return (
                  <tr key={equip.id} className="border-b border-border hover:bg-primary transition-colors">
                    <td className="px-6 py-3 text-sm text-text">{equip.name}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{obj?.name || "Unknown"}</td>
                    <td className="px-6 py-3 text-sm text-text capitalize">{equip.type}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          equip.status === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {equip.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(equip)}
                          className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(equip.id)}
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

        {/* Add/Edit Equipment Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? "Edit Equipment" : "Add New Equipment"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Equipment Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="e.g., Security Camera 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Object</label>
              <select
                value={formData.objectId}
                onChange={(e) => setFormData({ ...formData, objectId: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="">Select an object</option>
                {objects.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
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
                <option value="camera">Camera</option>
                <option value="sensor">Sensor</option>
                <option value="alarm">Alarm</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddEquipment}
                className="flex-1 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
              >
                {editingId ? "Update Equipment" : "Add Equipment"}
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
