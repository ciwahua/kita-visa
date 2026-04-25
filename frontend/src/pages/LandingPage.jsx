import { useState } from "react";
import "../styles/landing.css";
import { useNavigate, Link } from "react-router-dom";

export default function LandingPage() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [sessionId] = useState(() => "session" + Math.random().toString(36).substr(2, 9));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [validatingFiles, setValidatingFiles] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);

  const navigate = useNavigate();

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Handle file input change
  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  // Process files
  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Allow PDF
      const validTypes = ['application/pdf'];
      const validExtensions = ['.pdf'];
      
      const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      
      if (!isValidType) {
        setFileErrors(prev => [...prev, `${file.name}: Invalid file type. Only PDF allowed.`]);
      }
      if (!isValidSize) {
        setFileErrors(prev => [...prev, `${file.name}: File too large. Max 5MB.`]);
      }
      
      return isValidType && isValidSize;
    });

    setFiles([...files, ...validFiles]);
  };

  // Remove file
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Validate files with AI
  const validateFilesWithAI = async () => {
    if (files.length === 0) {
      setFileErrors(["Please upload at least one document"]);
      return false;
    }

    setValidatingFiles(true);
    setFileErrors([]);

    try {
      const formData = new FormData();
      formData.append("input", input);
      formData.append("sessionId", sessionId);
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("http://localhost:3001/api/validate-documents", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setFileErrors(data.errors || ["File validation failed"]);
        setValidatingFiles(false);
        return false;
      }

      setUploadedFiles(data.validatedFiles);
      setValidatingFiles(false);
      return true;
    } catch (err) {
      setFileErrors(["Failed to validate documents. Please try again."]);
      setValidatingFiles(false);
      return false;
    }
  };

  const handleSubmit = async () => {
  if (!input.trim()) {
    setResult({ error: "Please describe your situation" });
    return;
  }

  // Only validate files if user uploaded some
  if (files.length > 0) {
    const filesValid = await validateFilesWithAI();
    if (!filesValid) return;
  }

    setResult("loading");

    try {
      const res = await fetch("http://localhost:3001/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, sessionId, uploadedFiles }),
      });

      const data = await res.json();
      setResult(data);
      setConfirmationData(data);
      setShowConfirmation(true);
    } catch {
      setResult({ error: "Request failed" });
    }
  };

  const handleConfirm = async () => {
    setResult("loading");

    try {
      const visaType = confirmationData?.recommendation?.[0] || "Unknown";
      const res = await fetch("http://localhost:3001/api/analyze-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, visaType, uploadedFiles }),
      });

      const data = await res.json();
      setResult(data);

      navigate("/dashboard", { 
        state: { ...data, input, uploadedFiles } 
      });
    } catch {
      setResult({ error: "Request failed" });
    }
  };

  const handleAddMoreInfo = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
    setResult(null);
    setFiles([]);
    setUploadedFiles([]);
    setFileErrors([]);
  };

  return (
    <div className="page">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">KitaVisa</div>

        <nav className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/documents">Documents</Link>
            <Link to="/applications">Applications</Link>
            <Link to="/support">Support</Link>
        </nav>
      </header>

      {/* MAIN */}
      <main className="main">
        <section className="hero">
          <h1>Your Gateway to Malaysia, Simplified.</h1>
          <p>Describe your situation and let AI generate your visa workflow instantly.</p>

          <div className="features">
            <div className="card">Smart AI Analysis</div>
            <div className="card">Document Guidance</div>
          </div>
        </section>

        <section className="formBox">
          <label>Tell us your situation</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I got accepted to UM..."
          />

          <label>Upload Documents (Optional) *</label>
          <div 
            className="uploadBox"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p>Drag & drop files here or click to select</p>
            <p style={{ fontSize: "0.85em", color: "#666" }}>
              Supported: PDF (Max 5MB each)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              style={{ display: "none" }}
              id="fileInput"
            />
            <button
              type="button"
              onClick={() => document.getElementById("fileInput").click()}
              style={{ marginTop: "10px", cursor: "pointer" }}
            >
              Browse Files
            </button>
          </div>

          {/* Show uploaded files */}
          {files.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <h4>Uploaded Files ({files.length}):</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {files.map((file, index) => (
                  <li 
                    key={index}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      padding: "8px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      alignItems: "center"
                    }}
                  >
                    <span>📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{ 
                        background: "red", 
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        cursor: "pointer",
                        borderRadius: "3px"
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Show file errors */}
          {fileErrors.length > 0 && (
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#ffe0e0", borderRadius: "4px" }}>
              <h4 style={{ color: "red", marginTop: 0 }}>Issues:</h4>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "red" }}>
                {fileErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={!input.trim() || validatingFiles}
            style={{
              opacity: (!input.trim() || validatingFiles) ? 0.5 : 1,
              cursor: (!input.trim() || validatingFiles) ? "not-allowed" : "pointer"
            }}
          >
            {validatingFiles ? "Validating Documents..." : "Initialize Application"}
          </button>

          <div className="output">
            {result === "loading" && <p>Generating workflow...</p>}

            {showConfirmation && confirmationData && (
              <>
                <p>{confirmationData.message}</p>
                {confirmationData.recommendation && confirmationData.recommendation.length > 0 && (
                  <div>
                    <h4>Recommended Visas:</h4>
                    <ul>
                      {confirmationData.recommendation.map((visa, index) => (
                        <li key={index}>{visa}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  {confirmationData.needsConfirmation && (
                    <button onClick={handleConfirm}>Confirm & Continue</button>
                  )}
                  <button onClick={handleAddMoreInfo}>Add More Information</button>
                </div>
              </>
            )}

            {result && result.error && <p style={{ color: "red" }}>Error: {result.error}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}