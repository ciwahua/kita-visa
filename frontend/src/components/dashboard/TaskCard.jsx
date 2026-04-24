import React from "react";
import "../../styles/dashboard.css";

export default function TaskCard({ data }) {
  const gaps = data?.gaps || [];

  if (gaps.length === 0) {
    return <p>No tasks 🎉</p>;
  }

  return (
    <div className="task-list">
      {gaps.map((gap, index) => (
        <div key={index} className="task-card">
          
          <div className="task-header">
            <h3>{gap.field}</h3>

            <span className={gap.resolved ? "status-done" : "status-pending"}>
              {gap.resolved ? "Done" : "Action Required"}
            </span>
          </div>

          <p className="task-message">{gap.message}</p>

        </div>
      ))}
    </div>
  );
}