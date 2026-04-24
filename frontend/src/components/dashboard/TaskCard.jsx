import React from "react";
import "../../styles/dashboard.css";

export default function TaskCard({ tasks, gaps, setGaps }) {

  const handleComplete = (id) => {
    // Find the task and its linked gap
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Update the corresponding gap as resolved
    const updatedGaps = gaps.map((gap) =>
      gap.field === task.linkedGap
        ? { ...gap, resolved: true }
        : gap
    );

    setGaps(updatedGaps);
  };

  if (!tasks || tasks.length === 0) {
    return <p>No tasks 🎉</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {

        return (
          <div key={task.id} className="task-card">

            <div className="task-header">
              <h3>{task.title}</h3>

              <span
                className={
                  task.status === "completed"
                    ? "status-done"
                    : "status-pending"
                }
              >
                {task.status}
              </span>
            </div>

            <p className="task-message">
              {task.description}
            </p>

            {/* Action Button */}
            {/* ACTION AREA */}
            {task.status !== "completed" && (
              <div className="task-action">
                
                {/* TYPE: UPLOAD */}
                {task.type === "upload" && (
                  <button className="task-button">
                    Upload File
                  </button>
                )}

                {/* TYPE: INPUT */}
                {task.type === "input" && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter response..."
                      className="task-input"
                    />
                    <button className="task-button">
                      Submit
                    </button>
                  </div>
                )}

                {/* DEFAULT ACTION */}
                {!task.type && (
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="task-button"
                  >
                    Mark Complete
                  </button>
                )}

              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}