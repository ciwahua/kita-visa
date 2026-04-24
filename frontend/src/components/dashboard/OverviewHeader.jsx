import React from "react";
import "../../styles/dashboard.css"; // create this

export default function OverviewHeader({ data }) {
  const fullName = data?.extractedData?.applicantName || "User";
  const firstName = fullName.split(" ")[0];

  const pendingTasks =
    data?.gaps?.filter((gap) => gap?.resolved === false).length || 0;

  return (
    <div className="overview-header">
      
      <div className="overview-left">
        <h1>Student Visa Workflow</h1>
        <p>
          Welcome back, {firstName}. You have {pendingTasks} tasks requiring attention.
        </p>
      </div>

      <div className="overview-card">
        <div className="icon">⏱</div>

        <div>
          <p className="label">Estimated Completion</p>
          <p className="value">14 Working Days</p>
        </div>
      </div>

    </div>
  );
}