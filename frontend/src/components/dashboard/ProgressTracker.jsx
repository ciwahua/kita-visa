import React from "react";
import "../../styles/dashboard.css";

export default function ProgressTracker({ tasks = [], progress = 0 }) {

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const total = tasks.length;

  const isAllDone = total > 0 && completedCount === total;
  const hasStarted = completedCount > 0;

  const steps = [
    {
      step: "Tasks Review",
      status: hasStarted ? "done" : "active"
    },
    {
      step: "Verification",
      status: hasStarted
        ? isAllDone
          ? "done"
          : "active"
        : "locked"
    },
    {
      step: "Final Approval",
      status: isAllDone
        ? "active"
        : "locked"
    }
  ];

  const getDotClass = (status) => {
    if (status === "done") return "done";
    if (status === "active") return "active";
    return "pending"; // includes locked
  };

  return (
    <div className="progress-tracker">
      <h3>Application Journey</h3>

      {/* PROGRESS BAR */}
      <div className="task-progress">
        <p>{progress}% Complete</p>

        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* TIMELINE */}
      <div className="timeline">
        <div className="timeline-line"></div>

        {steps.map((step, index) => {

          const isDone = step.status === "done";
          const isActive = step.status === "active";

          return (
            <div key={index} className="timeline-item">

              {/* DOT */}
              <div className={`timeline-dot ${getDotClass(step.status)}`}>
                {isDone ? "✓" : index + 1}
              </div>

              {/* CONTENT */}
              <div>
                <p className="step-label">Step {index + 1}</p>

                <h4 className="step-title">
                  {step.step}
                </h4>

                <p className="step-subtext">
                  {isDone
                    ? "Completed"
                    : isActive
                    ? "In Progress"
                    : "Locked"}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}