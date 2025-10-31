"use client";

import { useState } from "react";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReportComponent({ report, onDelete, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSummarizing = async () => {
    try {
      const token = sessionStorage.getItem("access");
      const response = await fetch(`http://127.0.0.1:8000/report/summarize/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: report.subject,
          body: report.body,
        }), // Send as object
      });

      if (response.ok) {
        const data = await response.json(); // Parse the JSON response
        setSummary(data.message); // Access the message from the response data
      } else {
        console.error("Server responded with status:", response.status);
      }
    } catch (error) {
      console.error("Error summarizing report:", error);
    }
  };

  // Add delete handler function
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        const token = sessionStorage.getItem("access");
        const response = await fetch(
          `http://127.0.0.1:8000/report/${report.id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          onDelete(report.id); // Call parent to update state
        }
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  }; // Added missing closing brace

  // Edit handler - moved outside handleDelete
  const handleEdit = () => {
    onEdit(report);
  };

  if (!report) return null;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-text">{report.subject}</h3>
          <p className="text-text-secondary text-sm mt-1">
            Department: <span className="capitalize">{report.department}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Body Preview */}
      <div className="mb-4">
        <p className="text-text">
          {isExpanded ? report.body : `${report.body.substring(0, 200)}...`}
        </p>
        {report.body.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-accent hover:text-accent-light text-sm mt-2"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>

      {/* Categories */}
      {report.categories && report.categories.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {report.categories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary border border-border rounded text-xs text-text"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bibliographies */}
      {report.bibliographies && report.bibliographies.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Sources
          </h4>
          <ul className="text-sm text-text space-y-1">
            {report.bibliographies.map((bib, index) => (
              <li key={index} className="truncate">
                • {bib}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Documents */}
      {report.used_documents && report.used_documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Documents
          </h4>
          <ul className="text-sm text-text space-y-1">
            {report.used_documents.map((doc, index) => (
              <li key={index} className="truncate">
                • {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <button
          onClick={handleSummarizing}
          className="mt-4 px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors"
        >
          Summary
        </button>
        <div>{summary}</div>
      </div>
    </div>
  );
}
