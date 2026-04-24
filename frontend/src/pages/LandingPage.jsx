import { useState } from "react";
import "../styles/landing.css";

export default function LandingPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setResult("loading");

    try {
      const res = await fetch("http://localhost:3001/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Request failed" });
    }
  };

  return (
    <div className="page">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">KitaVisa</div>

        <nav className="nav-links">
          <a href="#">Dashboard</a>
          <a href="#">Documents</a>
          <a href="#">Applications</a>
          <a href="#">Support</a>
        </nav>
      </header>

      {/* MAIN */}
      <main className="main">

        {/* LEFT HERO */}
        <section className="hero">
          <h1>Your Gateway to Malaysia, Simplified.</h1>
          <p>
            Describe your situation and let AI generate your visa workflow instantly.
          </p>

          <div className="features">
            <div className="card">Smart AI Analysis</div>
            <div className="card">Document Guidance</div>
          </div>
        </section>

        {/* RIGHT FORM */}
        <section className="formBox">

          <label>Tell us your situation</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I got accepted to UM..."
          />

          <label>Upload Documents</label>
          <div className="uploadBox">
            Drag & drop files here
          </div>

          <button onClick={handleSubmit}>
            Initialize Application
          </button>

          {/* OUTPUT */}
          <div className="output">
            {result === "loading" && <p>Generating workflow...</p>}

            {result && result !== "loading" && result.visaType && (
              <>
                <h3>{result.visaType}</h3>
                <p>{result.summary}</p>
              </>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}