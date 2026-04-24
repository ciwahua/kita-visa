import React from "react";
import "../../styles/dashboard.css";

export default function ProgressTracker({ data }) {
  const steps = data?.timeline || [];

  return (
    <div className="progress-tracker">
      <h3>Application Journey</h3>

      {steps.map((step, index) => (
        <div key={index} className="step">
          <span className="step-status">
            {step.status === "done" ? "✅" : "⏳"}
          </span>

          <div>
            <p className="step-title">{step.step}</p>
            <p className="step-status-text">{step.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}