"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import Modal from "../../components/Modal"
import { formatDate } from "../../utils/helpers"

export default function ReportsPage() {
  const { reports, addReport, updateReport, deleteReport } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ title: "", type: "security", status: "pending" })

  const filteredReports = reports.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddReport = () => {
    if (formData.title) {
      if (editingId) {
        updateReport(editingId, formData)
        setEditingId(null)
      } else {
        addReport({ ...formData, date: new Date() })
      }
      setFormData({ title: "", type: "security", status: "pending" })
      setShowModal(false)
    }
  }

  const handleEdit = (report) => {
    setFormData({ title: report.title, type: report.type, status: report.status })
    setEditingId(report.id)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReport(id)
    }
  }

  const handleOpenModal = () => {
    setFormData({ title: "", type: "security", status: "pending" })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Reports & Statistics</h1>
            <p className="text-text-secondary">View and manage security reports</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-6 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            + Generate Report
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Reports Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-primary transition-colors">
                  <td className="px-6 py-3 text-sm text-text">{report.title}</td>
                  <td className="px-6 py-3 text-sm text-text capitalize">{report.type}</td>
                  <td className="px-6 py-3 text-sm text-text-secondary">{formatDate(report.date)}</td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(report)}
                        className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Report Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? "Edit Report" : "Generate New Report"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Report Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="e.g., Weekly Security Report"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Report Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="security">Security</option>
                <option value="equipment">Equipment</option>
                <option value="incident">Incident</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddReport}
                className="flex-1 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
              >
                {editingId ? "Update Report" : "Generate Report"}
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
