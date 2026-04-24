import React from "react";
import documentData from "../data/documentcontract.json";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import OverviewHeader from "../components/dashboard/OverviewHeader";
import ProgressTracker from "../components/dashboard/ProgressTracker";
import TaskCard from "../components/dashboard/TaskCard";

export default function Dashboard() {
  return (
    <div>

      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN LAYOUT */}
      <div className="dashboard-layout">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          
          <OverviewHeader data={documentData} />

          <div className="dashboard-grid">
            
            <div className="left-panel">
              <ProgressTracker data={documentData} />
            </div>

            <div className="right-panel">
              <TaskCard data={documentData} />
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}