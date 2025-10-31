"use client";

import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import ReportComponent from "../../components/ReportComponent";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    department: "security",
    body: "",
    bibliographies: [""],
    used_documents: [""],
    categories: [],
  });

  const CATEGORY_OPTIONS = [
    "security",
    "policy",
    "logistics",
    "research",
    "communication",
    "emergency",
    "administration",
  ];

  const filteredReports =
    reports?.filter((report) =>
      report?.subject?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
    ) || [];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = sessionStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/report/get/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // Update handleAddReport to handle both create and update
const handleAdd_Edit_Report = async () => {
  if (formData.subject && formData.body) {
    const token = sessionStorage.getItem("access");
    const user = JSON.parse(sessionStorage.getItem("user"));

    const reportData = {
      subject: formData.subject,
      body: formData.body,
      department: formData.department,
      bibliographies: formData.bibliographies.filter((b) => b.trim()),
      used_documents: formData.used_documents.filter((d) => d.trim()),
      categories: formData.categories,
      writer: user.id,
    };

    try {
      const url = editingId 
        ? `http://127.0.0.1:8000/report/${editingId}/`  // Update endpoint
        : "http://127.0.0.1:8000/report/create/";       // Create endpoint

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setFormData({
          subject: "",
          department: "security",
          body: "",
          bibliographies: [""],
          used_documents: [""],
          categories: [],
        });
        setEditingId(null);
        setShowModal(false);
        fetchReports(); // Refresh the list
      }
    } catch (error) {
      console.error("Error saving report:", error);
    }
  }
};

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const addBibliography = () => {
    setFormData((prev) => ({
      ...prev,
      bibliographies: [...prev.bibliographies, ""],
    }));
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      used_documents: [...prev.used_documents, ""],
    }));
  };

  const updateBibliography = (index, value) => {
    const updated = [...formData.bibliographies];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, bibliographies: updated }));
  };

  const updateDocument = (index, value) => {
    const updated = [...formData.used_documents];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, used_documents: updated }));
  };

  // Add delete handler function
  const handleDeleteReport = (deletedId) => {
    setReports((prev) => prev.filter((report) => report.id !== deletedId));
  };

  // Add edit handler
  const handleEditReport = (report) => {
    setFormData({
      subject: report.subject,
      department: report.department,
      body: report.body,
      bibliographies: report.bibliographies.length
        ? report.bibliographies
        : [""],
      used_documents: report.used_documents.length
        ? report.used_documents
        : [""],
      categories: report.categories || [],
    });
    setEditingId(report.id);
    setShowModal(true);
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">
              Reports & Statistics
            </h1>
            <p className="text-text-secondary">
              View and manage security reports
            </p>
          </div>
          <button
              onClick={() => {
                setEditingId(null); // Reset when creating new
                setShowModal(true);
              }}
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

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            // Pass onEdit to ReportComponent
            <ReportComponent
              key={report.id}
              report={report}
              onDelete={handleDeleteReport}
              onEdit={handleEditReport}
            />
          ))}
        </div>

        {/* Add Report Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? "Edit Report" : "Generate New Report"}
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                placeholder="Report subject/title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              >
                <option value="security">Security Department</option>
                <option value="immigration">Immigration Department</option>
                <option value="civil_protection">Civil Protection</option>
                <option value="finance">Finance Department</option>
                <option value="planning">Planning and Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Body *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent h-32"
                placeholder="Detailed report content (min 500 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Bibliographies
              </label>
              {formData.bibliographies.map((bib, index) => (
                <input
                  key={index}
                  type="text"
                  value={bib}
                  onChange={(e) => updateBibliography(index, e.target.value)}
                  className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent mb-2"
                  placeholder="Source URL or reference"
                />
              ))}
              <button
                onClick={addBibliography}
                className="text-sm text-accent hover:text-accent-light"
              >
                + Add Bibliography
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Used Documents
              </label>
              {formData.used_documents.map((doc, index) => (
                <input
                  key={index}
                  type="text"
                  value={doc}
                  onChange={(e) => updateDocument(index, e.target.value)}
                  className="w-full px-4 py-2 bg-primary border border-border rounded-lg text-text focus:outline-none focus:border-accent mb-2"
                  placeholder="Document name or path"
                />
              ))}
              <button
                onClick={addDocument}
                className="text-sm text-accent hover:text-accent-light"
              >
                + Add Document
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      formData.categories.includes(category)
                        ? "bg-accent text-primary border-accent"
                        : "bg-primary text-text border-border"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAdd_Edit_Report}
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
  );
}
