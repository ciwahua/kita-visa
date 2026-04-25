import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

// Tasks that require file upload based on their linkedGap field
const UPLOAD_REQUIRED_FIELDS = [
  "passportNumber",
  "admissionLetter",
  "financialProof",
  "accommodationProof",
  "employmentOffer",
  "workContract",
  "companyDetails",
  "employerDetails",
  "workPermit",
  "proofOfRelationship",
  "sponsorVisa",
  "returnTicket",
  "healthInsurance",
  "otherDocuments"
];

export default function TaskCard({ tasks, gaps, setGaps, visaType, input }) {
  const navigate = useNavigate();
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState({});

  const handleComplete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedGaps = gaps.map((gap) =>
      gap.field === task.linkedGap ? { ...gap, status: "completed" } : gap
    );
    setGaps(updatedGaps);
  };

  const handleFileUpload = async (taskId, file) => {
    if (!file) return;

    setUploadingId(taskId);
    setUploadErrors((prev) => ({ ...prev, [taskId]: null }));

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("input", input || "visa application");
      formData.append("sessionId", "session" + Date.now());

      const res = await fetch("http://localhost:3001/api/validate-documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadErrors((prev) => ({
          ...prev,
          [taskId]: data.errors?.[0] || "Upload failed",
        }));
        return;
      }

      // Store validated file info
      setUploadedDocs((prev) => ({
        ...prev,
        [taskId]: data.validatedFiles,
      }));

      // Mark task as completed
      handleComplete(taskId);

    } catch (err) {
      setUploadErrors((prev) => ({
        ...prev,
        [taskId]: "Upload failed. Please try again.",
      }));
    } finally {
      setUploadingId(null);
    }
  };

  const handleViewDocuments = () => {
    const allUploadedFiles = Object.values(uploadedDocs).flat();
    navigate("/documents", {
      state: {
        gaps,
        uploadedFiles: allUploadedFiles,
        input: input || "",
        visaType: visaType || "Unknown",
      },
    });
  };

  const hasUploads = Object.keys(uploadedDocs).length > 0;

  if (!tasks || tasks.length === 0) {
    return <p>No tasks 🎉</p>;
  }

  return (
    <div className="task-list">
      {hasUploads && (
        <button
          onClick={handleViewDocuments}
          className="task-button"
          style={{ marginBottom: "16px", backgroundColor: "#2563eb", color: "white" }}
        >
          View Extracted Documents →
        </button>
      )}

      {tasks.map((task) => {
        const requiresUpload = UPLOAD_REQUIRED_FIELDS.includes(task.linkedGap);
        const isUploading = uploadingId === task.id;
        const uploadError = uploadErrors[task.id];
        const uploadedFile = uploadedDocs[task.id];

        return (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className={task.status === "completed" ? "status-done" : "status-pending"}>
                {task.status}
              </span>
            </div>
            <p className="task-message">{task.description}</p>

            {task.status !== "completed" && (
              <div className="task-action" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>

                {/* UPLOAD BUTTON for relevant tasks */}
                {requiresUpload && (
                  <>
                    <input
                      type="file"
                      accept=".pdf"
                      id={`file-${task.id}`}
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(task.id, e.target.files[0])}
                    />
                    <label
                      htmlFor={`file-${task.id}`}
                      className="task-button"
                      style={{ cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.6 : 1 }}
                    >
                      {isUploading ? "Uploading..." : "📎 Upload PDF"}
                    </label>
                  </>
                )}

                {/* MARK COMPLETE for non-upload tasks */}
                {!requiresUpload && (
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="task-button"
                  >
                    Mark Complete
                  </button>
                )}

                {uploadError && (
                  <span style={{ color: "red", fontSize: "0.85em" }}>{uploadError}</span>
                )}
              </div>
            )}

            {/* Show uploaded file name */}
            {uploadedFile && (
              <p style={{ fontSize: "0.85em", color: "green", marginTop: "6px" }}>
                ✅ {uploadedFile[0]?.fileName} uploaded
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}