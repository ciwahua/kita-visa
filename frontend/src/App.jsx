import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3001/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>KitaVisa</h1>
      <p>Your AI Visa Workflow Assistant</p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. I got accepted to UM"
        style={{ width: "300px", padding: "8px" }}
      />

      <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
        Submit
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Visa Type: {result.visaType}</h3>
          <p>{result.summary}</p>

          <h4>Steps:</h4>
          <ul>
            {result.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>

          <strong>Next: {result.nextAction}</strong>
        </div>
      )}
    </div>
  );
}

export default App;