import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import "../styles/documents.css";

export default function Documents() {
  const { state } = useLocation();
  const navigate = useNavigate(); 
  const uploadedFiles = state?.uploadedFiles || [];
  const gaps = state?.gaps || [];
  const visaType = state?.visaType || "Unknown";

  return (
    <>
      <Navbar />
      <div className="documents-page">
        <Sidebar />
        <div className="documents-main">

          {/* HEADER */}
          <div className="documents-header">
            <div>
              <h1 className="documents-title">Document Analysis & Gap Detection</h1>
              <p className="documents-subtitle">
                {uploadedFiles.length > 0
                  ? `Reviewing ${uploadedFiles.length} document(s) — ${visaType}`
                  : "No documents uploaded"}
              </p>
            </div>
            <div>
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  alert("Application submitted successfully!");
                  navigate("/", { replace: true });
                }}
              >
                Submit Review
              </button>
            </div>
          </div>

          {/* SPLIT VIEW */}
          <div className="documents-grid">

            {/* LEFT - DOCUMENTS LIST */}
            <div className="document-preview">
              <h3>Uploaded Documents</h3>
              {uploadedFiles.length === 0 ? (
                <p style={{ color: "#888", marginTop: "16px" }}>No documents found.</p>
              ) : (
                uploadedFiles.map((file, i) => (
                  <div key={i} style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "12px" }}>
                    <p>📄 <b>{file.fileName}</b></p>
                    <p><b>Type:</b> {file.documentType || "Unknown"}</p>
                    <p><b>Uploaded:</b> {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : "—"}</p>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT - PANEL */}
            <div className="document-panel">

              {/* EXTRACTION SUMMARY */}
              <div className="doc-card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3>System Extraction</h3>
                  <span className="confidence">{visaType}</span>
                </div>
                <p style={{ color: "#666", fontSize: "0.9em", marginTop: "8px" }}>
                  {uploadedFiles.length} document(s) validated
                </p>
              </div>

              {/* GAPS */}
              {gaps.length === 0 ? (
                <div className="doc-card">
                  <p>✅ No gaps detected.</p>
                </div>
              ) : (
                gaps.map((gap, i) => (
                  <div
                    key={i}
                    className={`doc-card ${gap.severity === "high" ? "gap-critical" : "gap-medium"}`}
                  >
                    <h4>{gap.field}</h4>
                    <p>{gap.message}</p>
                    <span style={{ fontSize: "0.8em", color: "#888" }}>
                      Severity: {gap.severity} · Status: {gap.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}