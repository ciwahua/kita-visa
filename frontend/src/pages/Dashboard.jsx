import React, { useState, useEffect } from "react";
import documentData from "../data/documentContract.json";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import OverviewHeader from "../components/dashboard/OverviewHeader";
import ProgressTracker from "../components/dashboard/ProgressTracker";
import TaskCard from "../components/dashboard/TaskCard";

// =====================
// Helpers (task engine)
// =====================
const generateTaskTitle = (field, gapData) => {
  // Support AI-provided titles (future-proof)
  if (gapData?.title) return gapData.title;

  switch (field) {
    case "passportNumber":
      return "Upload Passport";
    case "offerType":
      return "Clarify Offer Type";
    default:
      return `Resolve ${field}`;
  }
};

const generateTasksFromGaps = (gaps = []) => {
  if (!Array.isArray(gaps)) return [];
  
  return gaps.map((gap, index) => ({
    id: `T${index + 1}`,
    title: generateTaskTitle(gap.field, gap),
    description: gap.message,
    linkedGap: gap.field,
    status: gap.resolved ? "completed" : "pending"
  }));
};

export default function Dashboard() {

  // Step 1: Keep state clean - store gaps (source of truth)
  const [gaps, setGaps] = useState(documentData?.gaps || []);

  // Step 2: Derive tasks from gaps (computed, not stored)
  const tasks = generateTasksFromGaps(gaps);

  // progress calculation
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100);

  // Sync gaps when documentData changes
  useEffect(() => {
    setGaps(documentData?.gaps || []);
  }, [documentData?.gaps]);

  return (
    <div>

      <Navbar />

      <div className="dashboard-layout">

        <Sidebar />

        <main className="dashboard-main">

          <OverviewHeader data={documentData} />

          <div className="dashboard-grid">

            <div className="left-panel">
              <ProgressTracker tasks={tasks} progress={progress} />
            </div>

            <div className="right-panel">

              <div className="section-title">
                <h2>Action Required</h2>
                <p>Complete these tasks to proceed with your application</p>
              </div>

              <TaskCard tasks={tasks} gaps={gaps} setGaps={setGaps} />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}