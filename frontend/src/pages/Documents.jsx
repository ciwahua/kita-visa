import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import documentData from "../data/documentContract.json";
import "../styles/documents.css";

export default function Documents() {
  const { extractedData, confidenceScore, gaps, fileName } = documentData;

  return (
    <>
      <Navbar />

      <div className="documents-page">

        {/* SAME SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <div className="documents-main">

          {/* HEADER */}
          <div className="documents-header">
            <div>
              <h1 className="documents-title">
                Document Analysis & Gap Detection
              </h1>
              <p className="documents-subtitle">
                Reviewing: {fileName}
              </p>
            </div>

            <div>
              <button>Save Draft</button>
              <button style={{ marginLeft: "10px" }}>
                Submit Review
              </button>
            </div>
          </div>

          {/* SPLIT VIEW */}
          <div className="documents-grid">

            {/* LEFT - DOCUMENT */}
            <div className="document-preview">
              <h3>{fileName}</h3>

              <div style={{ marginTop: "16px" }}>
                <p><b>Institution:</b> {extractedData.institution}</p>
                <p><b>Program:</b> {extractedData.program}</p>
                <p><b>Visa:</b> {extractedData.visaType}</p>
              </div>
            </div>

            {/* RIGHT - PANEL */}
            <div className="document-panel">

              {/* EXTRACTION */}
              <div className="doc-card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3>System Extraction</h3>
                  <span className="confidence">
                    {Math.round(confidenceScore * 100)}%
                  </span>
                </div>
              </div>

              {/* GAPS */}
              {gaps.map((gap, i) => (
                <div
                  key={i}
                  className={`doc-card ${
                    gap.severity === "critical"
                      ? "gap-critical"
                      : "gap-medium"
                  }`}
                >
                  <h4>{gap.field}</h4>
                  <p>{gap.message}</p>
                </div>
              ))}

            </div>

          </div>

        </div>
      </div>
    </>
  );
}